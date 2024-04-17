import {
    getFirestore,
  } from "firebase-admin/firestore";
  
  import { NextResponse } from "next/server";
  import { authenticateApiUser } from "@/util/api/middleware/authenticateApiUser";
  
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
    data.userUid = doc.id;
  
    return NextResponse.json(data, { status: 200 });
  }