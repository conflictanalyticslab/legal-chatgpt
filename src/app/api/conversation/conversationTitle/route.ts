/**
 * @file: /conversation/conversationTitle/route.ts - Uses LLM to generate title based on conversation
 *
 * @author Kevin Yu <yu.kevin2002@gmail.com>
 * @date Jul 2024
 */

import { getFirestore } from "firebase-admin/firestore";
import { authenticateApiUser } from "@/lib/api/middleware/authenticateApiUser";
import { loadUser } from "@/lib/api/middleware/loadUser";
import { queryOpenAi } from "@/lib/LLM_utils/queryOpenAi";
import queryLlama2 from "@/lib/LLM_utils/queryLlama2";
import { NextResponse } from "next/server";
import { authenticateUser, validatePromptCount } from "./utils/validation";
import {
  conversationTitleSchema,
  conversationTitleSchemaArray,
} from "@/models/ConversationTitleSchema";
import { apiErrorResponse, errorResponse } from "@/utils/utils";

/**
 * Fetches conversation titles from Firestore
 *
 * @param _
 * @returns
 */
export async function GET(_: Request) {
  try {
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
      .orderBy("timestamp", "desc")
      .get();

    // Due to the refactor of the conversationTitleSchema we have to filter out old conversations
    const queryResultsV2 = queryResults.docs
      .map((doc) => doc.data())
      .filter((doc) => doc.hasOwnProperty("updatedAt"))
      .map((doc) => {
        doc.timestamp = doc.timestamp.toDate();
        doc.updatedAt = doc.updatedAt.toDate();
        return doc;
      });
    const validTitles = conversationTitleSchemaArray.parse(queryResultsV2);

    return NextResponse.json({ titles: validTitles }, { status: 200 });
  } catch (error: unknown) {
    // console.log(errorResponse(error));
    return NextResponse.json(apiErrorResponse(error), { status: 400 });
  }
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
  const promptCount = validatePromptCount(decodedToken, user, userRef);
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

    // Return LLM generated title
    if (llmResponse) {
      return NextResponse.json({
        title,
      });
    }
  } catch (error) {
    //Do nothing so we can proceed to LLAMA model
    console.log(
      "====================== QUERYING LLAMA2 ======================"
    );
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
