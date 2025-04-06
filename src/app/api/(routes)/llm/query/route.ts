"use server";
import { NextRequest } from "next/server";
import { makeIterator, iteratorToStream } from "../iterator";

export async function POST(req: NextRequest, res: NextRequest) {

  const iterator = makeIterator(await req.json());
  const stream = await iteratorToStream(iterator);

  return new Response(stream);
}
