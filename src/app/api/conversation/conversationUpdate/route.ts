/**
 * @file: /api/conversation/conversationUpdate/route.ts - Uses LLM to generate title based on conversation 
 *
 * @autor Kevin Yu <yu.kevin2002@gmail.com>
 * @date Jul 2024
 */

import { getFirestore } from "firebase-admin/firestore";
import { authenticateApiUser } from "@/util/api/middleware/authenticateApiUser";
import { NextResponse } from "next/server";

/**
 * Upserting conversation to database
 *
 * @param req
 * @returns
 */
export async function POST(req: Request) {
  try {
    // Authorization
    const { earlyResponse, decodedToken } = await authenticateApiUser();

    if (earlyResponse) {
      return earlyResponse;
    }

    const { fullConversation, includedDocuments, title } = await req.json();

    //@ts-ignore
    const convoRef = getFirestore().collection("conversations").doc(decodedToken?.uid);
    
    if (!convoRef) {
      return NextResponse.json({ error: "No matching conversation found" }, { status: 404 });
    }

    try {
      await convoRef.update({ conversation: fullConversation, documents: includedDocuments, title });
    } catch (error) {
      console.error("Error updating conversation:", error);
      return NextResponse.json({ error: "Failed to update conversation" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
