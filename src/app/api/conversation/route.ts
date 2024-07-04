/**
 * @file: route.ts - api/conversation - api route for calling the normal LLM's response
 *
 * @author Kevin Yu <yu.kevin2002@gmail.com>
 * @date Jun 2024
 */

import { authenticateApiUser } from "@/util/api/middleware/authenticateApiUser";
import { loadUser } from "@/util/api/middleware/loadUser";
import { queryOpenAILLM, queryOpenAi } from "@/util/LLM_utils/queryOpenAi";
import queryLlama2 from "@/util/LLM_utils/queryLlama2";
import { NextResponse } from "next/server";
import GPT4Tokenizer from 'gpt4-tokenizer';
import { getFirestore } from "firebase-admin/firestore";
import { llama } from "@/app/chat/components/utils/LLM/normal_LLM_utils";

/**
 * 
 * @param req 
 * @returns 
 */
export async function GET(req: Request) {
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

  const {title} = await req.json();

  const queryResults = await getFirestore()
    .collection("conversations")
    .where("userUid", "==", decodedToken.user_id)
    .where("title", "==", title)
    .limit(1)
    .get();

  if (queryResults.empty) {
    return NextResponse.json(
      { error: "No matching conversation found" },
      { status: 404 }
    );
  }

  const doc = queryResults.docs[0];
  const data = doc.data();

  return NextResponse.json({ conversation: { ...data, uid: doc.id }}, { status: 200 });
}

/**
 * Retrieve LLM output
 * 
 * @param req 
 * @returns 
 */
export async function POST(req: Request) {
  // User authentication
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

  // Loads the user from the "users" collection
  const { user } = await loadUser(decodedToken);

  // Check if the user exists
  if (!user)
    return NextResponse.json({ error: "No user found" }, { status: 403 });

  // Check if the user has any more prompts left
  if (user.prompts_left < 0)
    return NextResponse.json({ error: "No prompts left" }, { status: 403 });

  // Request body data
  const { searchPrompt, documentPrompt, fullConversation } = await req.json();

  // Query Open AI LLM
  try {
    return await queryOpenAILLM(searchPrompt, documentPrompt, fullConversation);
  } catch (error) {
    //Do nothing and continue to use llama
  }

  try {
    const llmResponse:any = await llama(
      searchPrompt,
      documentPrompt,
      fullConversation
    );
    return NextResponse.json({
      latestBotResponse: llmResponse.choices[0].message.content,
    });
  } catch (error) {
    return NextResponse.json({
      latestBotResponse: "Error retrieving LLM response",
    });
  }
}



