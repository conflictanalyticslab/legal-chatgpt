import admin from "firebase-admin";
import { DecodedIdToken } from "firebase-admin/auth";

import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { initBackendFirebaseApp } from "./init-backend-firebase-app";

export async function authenticateApiUser(): Promise<{
  errorResponse?: NextResponse<{ error: string }>;
  decodedToken?: DecodedIdToken;
}> {
  const headersList = headers();

  if (!headersList.get("authorization")?.startsWith("Bearer ")) {
    return {
      errorResponse: NextResponse.json(
        { error: "Expected authorization header to start with 'Bearer '" },
        { status: 401 }
      ),
    };
  }

  const token = headersList.get("authorization")?.split("Bearer ")[1];
  if (!token) {
    return {
      errorResponse: NextResponse.json(
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
      errorResponse: NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      ),
    };
  }
}
