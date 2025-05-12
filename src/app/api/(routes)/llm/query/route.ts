"use server";
import { NextRequest } from "next/server";
import { makeIterator, iteratorToStream } from "../iterator";

const getCorsHeaders = (origin: string) => ({
  "Access-Control-Allow-Origin": origin,
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Credentials": "true",
});

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get("origin") || "http://localhost:3000";
  const corsHeaders = getCorsHeaders(origin);
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  const origin = req.headers.get("origin") || "http://localhost:3000";
  const corsHeaders = getCorsHeaders(origin);

  const iterator = makeIterator(await req.json());
  const stream = await iteratorToStream(iterator);

  return new Response(stream, { headers: corsHeaders });
}
