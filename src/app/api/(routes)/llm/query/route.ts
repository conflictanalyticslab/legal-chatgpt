import { NextRequest, NextResponse } from "next/server";
import { makeIterator, iteratorToStream } from "../iterator";
import { getAuthenticatedUser } from "@/lib/auth/get-authenticated-user";

const getCorsHeaders = (origin: string) => ({
  "Access-Control-Allow-Origin": origin,
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Credentials": "true",
});

export async function POST(req: NextRequest) {
  const origin = req.headers.get("origin") || (process.env.NODE_ENV === 'development' ? '*' : 'https://openjustice.ai');
  const corsHeaders = getCorsHeaders(origin);

  // Check authentication first
  const decodedToken = await getAuthenticatedUser();
  if (decodedToken instanceof NextResponse) {
    const response = decodedToken;
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  }

  const iterator = makeIterator(await req.json());
  const stream = await iteratorToStream(iterator);
  return new Response(stream, { headers: corsHeaders });
}
