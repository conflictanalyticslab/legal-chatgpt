import admin from "firebase-admin";
import { DecodedIdToken } from "firebase-admin/auth";

import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { initBackendFirebaseApp } from "./initBackendFirebaseApp";

export async function authenticateApiUser(): Promise<{
  earlyResponse?: NextResponse<{ error: string }>;
  decodedToken?: DecodedIdToken;
}> {
  const headersList = headers();

  if (!headersList.get("authorization")?.startsWith("Bearer ")) {
    return {
      earlyResponse: NextResponse.json(
        { error: "Expected authorization header to start with 'Bearer '" },
        { status: 401 }
      ),
    };
  }

  const token = headersList.get("authorization")?.split("Bearer ")[1];
  if (!token) {
    return {
      earlyResponse: NextResponse.json(
        { error: "Missing bearer token" },
        { status: 401 }
      ),
    };
  }

  initBackendFirebaseApp();

  try {
    // Verify the token is valid
    return { decodedToken: await admin.auth().verifyIdToken(token) };
  } catch (error) {
    console.log(error);
    return {
      earlyResponse: NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      ),
    };
  }
}
