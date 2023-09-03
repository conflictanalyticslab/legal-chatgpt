import admin from "firebase-admin";

import { NextApiRequest } from "next";
import { NextResponse } from "next/server";

export const middleware = async (req: NextApiRequest) => {
  if (!process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT) {
    return NextResponse.json(
      { error: "Missing environment variables" },
      { status: 500 }
    );
  }

  console.log("EXECUTING MIDDLEWARE! ");

  if (
    !req.headers.authorization ||
    req.headers.authorization.startsWith("Bearer ")
  ) {
    return NextResponse.json(
      { error: "Expected authorization header to start with 'Bearer '" },
      { status: 401 }
    );
  }

  const token = req.headers.authorization?.split("Bearer ")[1];
  if (!token) {
    return NextResponse.json(
      { error: "Missing bearer token" },
      { status: 401 }
    );
  }

  admin.initializeApp({
    credential: admin.credential.cert(
      JSON.parse(process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT)
    ),
    databaseURL: "https://legal-gpt-default-rtdb.firebaseio.com",
  });

  try {
    // Verify the token is valid
    await admin.auth().verifyIdToken(token);
    return NextResponse.next();
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
};

export const config = {
  matcher: "/api/*",
};
