/**
 * @file: /conversation/conversationTitle/route.ts - Uses LLM to generate title based on conversation 
 * TODO: This route is called from postConversationSave.tsx this route therefore should not be called /convesationTitle
 * 
 * @author Kevin Yu <yu.kevin2002@gmail.com>
 * @date Jul 2024
 */

import { getFirestore } from "firebase-admin/firestore";
import { authenticateApiUser } from "@/util/api/middleware/authenticateApiUser";
import { loadUser } from "@/util/api/middleware/loadUser";
import { queryOpenAi } from "@/util/LLM_utils/queryOpenAi";
import queryLlama2 from "@/util/LLM_utils/queryLlama2";
import { NextResponse } from "next/server";
import { authenticateUser, validatePromptCount } from "./utils/validation";
import { createDoc } from "@/lib/firebase/crud_utils";

/**
 * Gets conversation titles
 *
 * @param _
 * @returns
 */
export async function GET(_: Request) {
  // Authentication
  const { earlyResponse, decodedToken } = await authenticateApiUser();
  if (earlyResponse) {
    return earlyResponse;
  }

  if (!decodedToken) {
    return NextResponse.json(
      { error: "decodedToken is missing but there was no earlyResponse" },
      { status: 500 }
    );
  }

  const queryResults = await getFirestore()
    .collection("conversations")
    .where("userUid", "==", decodedToken.user_id)
    // .orderBy("timestamp", "desc") TODO: When timestamp index is added sort the conversations by timestamp
    .get();

  const titles = queryResults.docs.map((doc) => {
    const data = doc.data();
    return { title: data.title, uid: doc.id };
  });

  return NextResponse.json({ titles }, { status: 200 });
}

/**
 * Upserting conversation to database
 *
 * @param req
 * @returns
 */
export async function POST(req: Request) {
  // Authorization
  const { earlyResponse, decodedToken } = await authenticateApiUser();

  // Load user from firestore database
  //@ts-ignore
  const { user, userRef } = await loadUser(decodedToken);

  // Authenticates user
  const decodedTokenResp = authenticateUser(earlyResponse, decodedToken);
  if (decodedTokenResp instanceof NextResponse) return decodedTokenResp;

  // Checks for user in database and updates their prompt count
  const promptCount = validatePromptCount(decodedToken,user, userRef);
  if (promptCount instanceof NextResponse) return promptCount;

  const { conversation, includedDocuments } = await req.json();

  // Check for empty conversation
  if (conversation.length === 0) {
    return NextResponse.json(
      { error: "Conversation data is empty" },
      { status: 400 }
    );
  }

  // Query Open AI
  try {
    const llmResponse: any = await queryOpenAi({
      model: "gpt-4-turbo-2024-04-09",
      messages: [
        ...conversation,
        {
          role: "user",
          content: "give a title to the current conversation with no quotes.",
        },
      ],
    });

    const title = llmResponse.choices[0].message.content;
    console.log("this is the conversationTitle from route", title)

    // Return LLM generated title
    if (llmResponse) {
      return NextResponse.json({
        title,
      });
    }

  } catch (error) {
    console.log(
      "====================== QUERYING LLAMA2 ======================"
    );
    //Do nothing so we can proceed to LLAMA model
  }

  // Querying LLAMA
  try {
    const llmResponse: any = await queryLlama2({
      messages: [
        ...conversation,
        {
          role: "user",
          content: "give a title to the current conversation.",
        },
      ],
    });

    const title = llmResponse.choices[0].message.content;

    // Return LLM generated title
    if (!llmResponse)
      return NextResponse.json(
        { error: "Failed to generate title for conversation" },
        { status: 400 }
      );

    //@ts-ignore
    createDoc("conversations", {
      conversation: conversation,
      documents: includedDocuments,
      title: title,
      userUid: decodedToken?.uid,
    });
    
    // Return back Response
    return NextResponse.json({
      title,
    });
  } catch (error) {
    console.error(
      "queryLlama2 failed in conversation/route.ts for second response: ",
      error
    );
    // Return error failed to generate title
    return NextResponse.json(
      { error: "Failed to generate title for conversation" },
      { status: 400 }
    );
  }
}
