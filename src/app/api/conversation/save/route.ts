import {
  getFirestore,
} from "firebase-admin/firestore";

import { UserI } from "@/util/User";

import { NextResponse } from "next/server";
import { authenticateApiUser } from "@/util/api/middleware/authenticateApiUser";

import { initBackendFirebaseApp } from "@/util/api/middleware/initBackendFirebaseApp";
import { userConverter } from "@/util/User";

// // Deprecated!!! Get the conversation for the current user given the title of the conversation
// export async function GET(req: Request) {
//   const { earlyResponse, decodedToken } = await authenticateApiUser();
//   if (earlyResponse) {
//     return earlyResponse;
//   }

//   if (!decodedToken) {
//     return NextResponse.json(
//       { error: "decodedToken is missing but there was no earlyResponse" },
//       { status: 500 }
//     );
//   }

//   const url = new URL(req.url);
//   const title = url.searchParams.get('title');

//   const queryResults = await getFirestore()
//     .collection("conversations")
//     .where("userUid", "==", decodedToken.user_id)
//     .where("title", "==", title)
//     .limit(1)
//     .get();

//   if (queryResults.empty) {
//     return NextResponse.json(
//       { error: "No matching conversation found" },
//       { status: 404 }
//     );
//   }

//   const doc = queryResults.docs[0];
//   const data = doc.data();

//   return NextResponse.json({ conversation: { ...data, uid: doc.id }}, { status: 200 });
// }

export async function PUT(req: Request) {
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

  const { uid, fullConversation, includedDocuments, title } = await req.json();

  initBackendFirebaseApp();

  try {
    const convoRef = getFirestore().collection("conversations").doc(uid);

    if (!convoRef) {
      return NextResponse.json({ error: "No matching conversation found" }, { status: 404 });
    }

    await convoRef.update({ conversation: fullConversation, includedDocuments: includedDocuments, title: title });
    return NextResponse.json({ uid }, { status: 200 });
  } catch (error: any) {
    console.error("conversation uid: ", uid, error.message);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// Upload a document
// This endpoint requires Node v20 or later
// If this is failing locally, check your node version by running `node -v` in the terminal
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

  const { fullConversation, includedDocuments, title } = await req.json();

  initBackendFirebaseApp();
  
  try {

    const docRef = await getFirestore().collection("conversations").doc()
    
    await docRef.create({
      conversation: fullConversation,
      documents: includedDocuments,
      title: title,
      userUid: decodedToken.user_id,
    });

    console.log(docRef.id);
    const userDocRef = getFirestore().collection("users").doc(decodedToken.user_id).withConverter(userConverter);
    
    const data: UserI | undefined = (await userDocRef.get()).data();
    if (typeof data != "undefined") {
      const to_update = ((data == null) ? [] : data.conversations).concat([docRef.id]);

    
      // console.log(to_update);
      await userDocRef.update({conversations: to_update});
    }
    return NextResponse.json(
      {
        uid: docRef.id,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error(error.message);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
