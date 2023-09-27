import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { initBackendFirebaseApp } from "@/util/api/middleware/initBackendFirebaseApp";
import { validEmailRegex } from "@/util/signup/validEmailRegex";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  if (!validEmailRegex.test(email)) {
    return NextResponse.json({}, { status: 403 });
  }

  initBackendFirebaseApp();

  try {
    const user = await admin.auth().createUser({
      email,
      password,
    });

    await getFirestore().collection("users").doc(user.uid).set({
      email,
      conversations: [],
      role: "default",
      prompts_allowed: 10,
      prompts_left: 10,
      verified: true,
    });

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
