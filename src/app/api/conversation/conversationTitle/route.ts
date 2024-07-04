import {
  getFirestore,
} from "firebase-admin/firestore";
import { getDocumentText } from "@/util/api/firebase_utils/getDocuments";
import { authenticateApiUser } from "@/util/api/middleware/authenticateApiUser";
import { loadUser } from "@/util/api/middleware/loadUser";
import { queryOpenAi } from "@/util/LLM_utils/queryOpenAi";
import queryLlama2 from "@/util/LLM_utils/queryLlama2";
import { NextResponse } from "next/server";

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
    .get();

  const plainJsObjects = queryResults.docs.map((doc) => {
    const data = doc.data();
    return { title: data.title, uid: doc.id };
  });

  return NextResponse.json({ conversations: plainJsObjects }, { status: 200 });
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

  if (earlyResponse) {
    return earlyResponse;
  }

  if (!decodedToken) {
    return NextResponse.json(
      { error: "decodedToken is missing but there was no earlyResponse" },
      { status: 500 }
    );
  }

  const { fullConversation, includedDocuments} = await req.json();


  if (fullConversation.length === 0) {
    return NextResponse.json(
      { error: "Conversation data is empty" },
      { status: 400 }
    );
  }

  // Load user from firestore database
  const { user, userRef } = await loadUser(decodedToken);

  if (user && user.prompts_left > 0) {
    await userRef.update({ prompts_left: user.prompts_left - 1 }); // Update the number of prompts the user has left in the database
    
    let firstReplyRes: any;
    let gpt_flag = true;
    try {
      firstReplyRes = await queryOpenAi({
        model: "gpt-4-turbo-2024-04-09",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant"
          },
          ...fullConversation,
          {
            role: "user",
            content: "give a title to the current conversation."
          }
        ],
      });
      if (!firstReplyRes || !firstReplyRes.choices || firstReplyRes.choices.length === 0) {
        gpt_flag = false;
      }
    } catch (error) {
      console.error("queryOpenAi failed: " + error);
      gpt_flag = false;
    }

    if (!gpt_flag) {
        console.error("Error from OpenAI: " + firstReplyRes);
        console.log("switching to llama2 in conversation/searchTerms/route.ts");

        try {
          firstReplyRes = await queryLlama2({
            messages: [
              {
                role: "system",
                content:
                  "You are a helpful assistant"
              },
              ...fullConversation,
              {
                role: "user",
                content: "give a title to the current conversation."
              }
            ],
          });
          console.log("Logging response from llama2", firstReplyRes.choices[0].message.content);
        } catch (error) {
          console.error("queryLlama2 failed in conversation/searchTerms/route.ts: " + error);
        };
    }

    const conversationTitle = firstReplyRes.choices[0].message.content;

    return NextResponse.json({title: conversationTitle})
  }
    return NextResponse.json({ error: "User has no prompts left" }, { status: 403 });
};
