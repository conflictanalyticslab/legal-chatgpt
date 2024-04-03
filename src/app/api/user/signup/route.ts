import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { initBackendFirebaseApp } from "@/util/api/middleware/initBackendFirebaseApp";
import { validEmailRegex } from "@/util/signup/validEmailRegex";
import { publicEmailRegex } from "@/util/signup/publicEmailRegex";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  if (!validEmailRegex.test(email) && publicEmailRegex.test(email)) {
    return NextResponse.json({}, { status: 403 });
  }

  initBackendFirebaseApp();

  try {
    const user = await admin.auth().createUser({
      email,
      password,
    });

    // console.log("Successfully created new user:", user.uid);

    if (validEmailRegex.test(email)) {

      await getFirestore().collection("users").doc(user.uid).set({
        email,
        conversations: [],
        role: "partner",
        prompts_allowed: 100,
        prompts_left: 100,
        verified: true,
      });

    } else if (!publicEmailRegex.test(email)) {

      await getFirestore().collection("users").doc(user.uid).set({
        email,
        conversations: [],
        role: "guest",
        prompts_allowed: 25,
        prompts_left: 25,
        verified: true,
      });

    }

    return NextResponse.json(
      {
        user,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error(error.message);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
