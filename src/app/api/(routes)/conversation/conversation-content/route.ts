/**
 * @file: route.ts - Gets the conversation data for a specific conversation
 *
 * @author Kevin Yu <yu.kevin2002@gmail.com>
 * @date Oct 2024
 */

import { getFirestore } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/get-authenticated-user";

export async function POST(req: Request) {
  // Authenticates user
  const decodedToken = await getAuthenticatedUser();
  if (decodedToken instanceof NextResponse) return decodedToken;

  const { conversationId } = await req.json();

  const docRef = await getFirestore()
    .collection("conversations")
    .doc(conversationId);

  const docSnapshot = await docRef.get();

  if (!docSnapshot.exists) {
    return NextResponse.json(
      { error: "No matching conversation found" },
      { status: 404 }
    );
  }

  const data = docSnapshot.data();

  return NextResponse.json(data, { status: 200 });
}
