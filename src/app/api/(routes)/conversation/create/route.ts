/**
 * @file: /api/conversation/insert/route.ts - Insert a new conversation document
 *
 * @author Kevin Yu <yu.kevin2002@gmail.com>
 * @date Jul 2024
 */

import { NextResponse } from "next/server";

import { initBackendFirebaseApp } from "@/lib/middleware/init-backend-firebase-app";
import { Timestamp } from "firebase-admin/firestore";
import { createDoc } from "@/lib/firebase/firebase-admin/create-doc";
import { conversationSchema } from "@/app/features/chat/models/schema";
import { getAuthenticatedUser } from "@/lib/auth/get-authenticated-user";

/**
 * Remember that PUT methods are idempotent meaning the same request should have the same effect as a single request.
 * Therefore PUT methods are typically for updating
 *
 * @param req
 * @returns
 */
export async function POST(req: Request) {

  // Authenticates user
  const decodedToken = await getAuthenticatedUser();
  if (decodedToken instanceof NextResponse) return decodedToken;

  const { conversation, includedDocuments, title } = await req.json();

  initBackendFirebaseApp();

  try {
    const currentDate = Timestamp.now().toDate();

    const validData = conversationSchema.partial().parse({
      conversation,
      includedDocuments,
      userUid: decodedToken?.uid,
      title,
      timestamp: currentDate,
      updatedAt: currentDate,
    });
    const docInfo = await createDoc("conversations", validData);
    if (!docInfo.success) throw new Error("Failed save conversation");

    validData["conversationId"] = docInfo.data; //Add back in the generated convo id which is the doc id

    return NextResponse.json(
      { success: true, error: null, data: validData },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("conversation uid: ", decodedToken?.uid, error.message);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
