/**
 * @file: /api/conversation/update/route.ts - Upsert an existing conversation document 
 *
 * @author Kevin Yu <yu.kevin2002@gmail.com>
 * @date Jul 2024
 */

import { NextResponse } from "next/server";
import { authenticateApiUser } from "@/lib/api/middleware/authenticateApiUser";

import { initBackendFirebaseApp } from "@/lib/api/middleware/initBackendFirebaseApp";
import { authenticateUser } from "../conversationTitle/utils/validation";
import { getDocRef, updateDoc } from "@/lib/firebase/crud_utils";

/**
 * Remember that PUT methods are idempotent meaning the same request should have the same effect as a single request.
 * Therefore PUT methods are typically for updating
 * 
 * @param req 
 * @returns 
 */
export async function PUT(req: Request) {
  const { earlyResponse, decodedToken } = await authenticateApiUser();
  
  // Authenticates user
  const decodedTokenResp = authenticateUser(earlyResponse, decodedToken);
  
  if (decodedTokenResp instanceof NextResponse) 
    return decodedTokenResp;

  // Note uid is the conversationId from the frontend
  const { uid, conversation, includedDocuments, title, conversationId } = await req.json();

  initBackendFirebaseApp();

  try {
    const convoRef = await getDocRef("conversations", conversationId);
    if (!convoRef) {
      return NextResponse.json({ error: "No matching conversation found" }, { status: 404 });
    }
    
    await updateDoc(convoRef, { conversation, includedDocuments } )
    return NextResponse.json({ uid }, { status: 200 });
  } catch (error: any) {
    console.error("conversation uid: ", uid, error.message);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
