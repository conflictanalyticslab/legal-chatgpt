// import admin from "firebase-admin";

import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  // Get the origin from the request headers
  const origin = req.headers.get("origin") || "http://localhost:3000";
  console.log("EXECUTING MIDDLEWARE! ");

  // Note these headers are only applied to edge routes and app pages and layouts

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  // Add CORS headers to all responses
  const corsHeaders = {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
  };

  // change the following to process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT when deploying to production
  if (!process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT) {
    return NextResponse.json(
      { error: "Missing environment variables" },
      { status: 500, headers: corsHeaders }
    );
  }

  // const authorization = req.headers.get("authorization");
  // if (!authorization || !authorization.startsWith("Bearer ")) {
  //   return NextResponse.json(
  //     { error: "Expected authorization header to start with 'Bearer '" },
  //     { status: 401, headers: corsHeaders }
  //   );
  // }

  // const token = authorization.split("Bearer ")[1];
  // if (!token) {
  //   return NextResponse.json(
  //     { error: "Missing bearer token" },
  //     { status: 401, headers: corsHeaders }
  //   );
  // }

  // // change the following to process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT when deploying to production
  // admin.initializeApp({
  //   credential: admin.credential.cert(
  //     JSON.parse(process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT)
  //   ),
  //   databaseURL: "https://legal-gpt-default-rtdb.firebaseio.com",
  // });

  // try {
  //   // Verify the token is valid
  //   await admin.auth().verifyIdToken(token);
  //   const response = NextResponse.next();
  //   // Add CORS headers to successful responses
  //   Object.entries(corsHeaders).forEach(([key, value]) => {
  //     response.headers.set(key, value);
  //   });
  //   return response;
  // } catch (error) {
  //   return NextResponse.json(
  //     { error: "Unauthorized" },
  //     { status: 401, headers: corsHeaders }
  //   );
  // }
}

export const config = {
  matcher: "/api/*",
};
