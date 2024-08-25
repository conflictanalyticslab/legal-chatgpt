import { getFirestore } from "firebase-admin/firestore";

import { NextResponse } from "next/server";
import { authenticateApiUser } from "@/lib/api/middleware/authenticateApiUser";

// Get the conversation for the current user given the title of the conversation
export async function POST(req: Request) {
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

  const { conversationId } = await req.json();

  const docRef = await getFirestore()
    .collection("conversations")
    .doc(conversationId);
  const docSnapshot = await docRef.get();
  const test = docSnapshot.data();
  
  if (!docSnapshot.exists) {
    return NextResponse.json(
      { error: "No matching conversation found" },
      { status: 404 }
    );
  }

  const data = docSnapshot.data();

  return NextResponse.json(data, { status: 200 });
}
