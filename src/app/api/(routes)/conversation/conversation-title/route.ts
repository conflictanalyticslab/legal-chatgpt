/**
 * @file: /conversation/conversationTitle/route.ts - Uses LLM to generate title based on conversation
 *
 * @author Kevin Yu <yu.kevin2002@gmail.com>
 * @date Jul 2024
 */

import { getFirestore } from "firebase-admin/firestore";
import { authenticateApiUser } from "@/lib/middleware/authenticate-api-user";
import { NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/utils";
import { conversationTitleSchemaArray } from "@/app/features/chat/models/schema";
import { getAuthenticatedUser } from "@/lib/auth/get-authenticated-user";
import { validatePromptCount } from "@/lib/llm/validate-prompt-count";
import { queryOpenAI } from "@/app/features/chat/lib/query-open-ai";
import { loadUser } from "@/lib/middleware/load-user";

/**
 * Fetches conversation titles from Firestore
 *
 * @param _
 * @returns
 */
export async function GET(_: Request) {
  try {
    // Authenticates user
    const decodedToken = await getAuthenticatedUser();
    if (decodedToken instanceof NextResponse) return decodedToken;
    if (!decodedToken) throw "decoded token undefined";

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
  // Authenticates user
  const decodedToken = await getAuthenticatedUser();

  if (decodedToken instanceof NextResponse) return decodedToken;
  if (!decodedToken) throw "Decoded token undefined";
  
  // Load user from firestore database
  const { user, userRef } = await loadUser(decodedToken);

  // Checks for user in database and updates their prompt count
  const promptCount = validatePromptCount(decodedToken, user, userRef);
  if (promptCount instanceof NextResponse) return promptCount;

  const { conversation } = await req.json();

  // Check for empty conversation
  if (conversation.length === 0) {
    return NextResponse.json(
      { error: "Conversation data is empty" },
      { status: 400 }
    );
  }

  // Query Open AI
  try {
    const llmResponse: any = await queryOpenAI({
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
    return NextResponse.json(
      { error: "Failed to generate title for conversation" },
      { status: 400 }
    );
  }
}
