/**
 * @file: route.ts - api/conversation - api route for calling the normal LLM's response
 *
 * @author Kevin Yu <yu.kevin2002@gmail.com>
 * @date Jun 2024
 */

import { NextResponse } from "next/server";
import { getFirestore } from "firebase-admin/firestore";
import { queryOpenAi } from "@/lib/LLM_utils/queryOpenAi";
import queryLlama2 from "@/lib/LLM_utils/queryLlama2";
import { authenticateUser } from "./update/utils/upsert_validation";
import { validateConversation, validateLoadedUser, validateTokenCount } from "./update/utils/upsert_validation";
import { authenticateApiUser } from "@/lib/api/middleware/authenticateApiUser";

/**
 * Get a specific conversation that the user requests
 * 
 * @param req - request data
 * @param req.title - conversation title to search for
 * @returns - the conversation including the title, and Uid
 */
export async function GET(req: Request) {
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

  const {title} = await req.json(); // The conversation title (which will be used alongside the uid to identify the document)

  // Fetches conversation from firestore
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

  // Get the first queried document and return its data
  const doc = queryResults.docs[0];
  const data = doc.data();

  return NextResponse.json({ conversation: { ...data, uid: doc.id }}, { status: 200 });
}

/**
 * Retrieve LLM output
 * 
 * @param req - request data
 * @param req.searchPrompt - the user's query
 * @param req.documentPrompt - the included document ids for the search prompt
 * @param req.conversation - the full conversation between user and assistant (LLM)
 * @returns 
 */
export async function POST(req: Request) {
  // Request body data
  const { searchPrompt, documentPrompt, conversation } = await req.json();

  // Authenticate User
  const decodedToken = await authenticateUser();
  if (decodedToken instanceof NextResponse) return decodedToken;
  
  // Check for valid user
  const user = await validateLoadedUser(decodedToken);
  if (user instanceof NextResponse) return user;

  // Check for valid user
  const validConversation = await validateConversation(conversation);
  if (validConversation instanceof NextResponse) return validConversation;

  // Composing full user query with included uploaded document data and the user's query
  const fullPrompt =`Answer in 500 words or less. Short answers are better.\n\n${documentPrompt}\n\n${searchPrompt}`;
  conversation[conversation.length - 2].content = fullPrompt;

  // Query Open AI LLM
  try 
  {
    const llmResponse = await queryOpenAi(
      {
        model: "gpt-3.5-turbo-0125",
        format: "markdown",
        messages: [...conversation],
      },
      true
    );

    // Return response back
    if (llmResponse)
      return llmResponse;
  } 
  catch (error) 
  {
    console.log("====================== QUERYING LLAMA2 ======================")
    //Do nothing so we can proceed to LLAMA model
  }

  // Validate token count before sending input to LLAMA
  const tokenCount = await validateTokenCount(searchPrompt, documentPrompt, conversation)
  if (tokenCount instanceof NextResponse) return tokenCount;

  // Querying LLAMA
  try 
  {
    const llmResponse:any = await queryLlama2({
        messages: [...conversation],
    });

    return NextResponse.json({
      latestBotResponse: llmResponse.choices[0].message.content,
    });
  } 
  catch (error) 
  {
    console.error(
      "queryLlama2 failed in conversation/route.ts for second response: ",
      error
    );
    return NextResponse.json({
      latestBotResponse: "Error retrieving LLM response",
    });
  }
}

