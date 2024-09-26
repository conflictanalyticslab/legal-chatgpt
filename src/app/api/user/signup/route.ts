import { initBackendFirebaseApp } from "@/lib/api/middleware/initBackendFirebaseApp";
import { validEmailRegex } from "@/lib/signup/validEmailRegex";
import { publicEmailRegex } from "@/utils/publicEmailRegex";
import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  if (publicEmailRegex.test(email)) {
    return NextResponse.json({}, { status: 403 });
  }

  initBackendFirebaseApp();

  try {
    const user = await admin.auth().createUser({
      email,
      password,
    });


    if (validEmailRegex.test(email)) {

      await getFirestore().collection("users").doc(user.uid).set({
        email,
        role: "partner",
        prompts_allowed: 100,
        prompts_left: 100,
        verified: true,
      });

    } else if (!publicEmailRegex.test(email)) {

      await getFirestore().collection("users").doc(user.uid).set({
        email,
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
