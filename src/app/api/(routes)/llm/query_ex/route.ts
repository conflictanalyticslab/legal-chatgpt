"use server";
import { NextRequest, NextResponse } from "next/server";
import { getFirestore } from "firebase-admin/firestore";
import { authenticateApiUser } from "@/lib/middleware/authenticate-api-user";
import { initBackendFirebaseApp } from "@/lib/middleware/init-backend-firebase-app";
import { compileGraph } from "@/app/features/chat/components/dialog-flows/compiler";
import { makeIterator, iteratorToStream } from "../iterator";

export async function POST(req: NextRequest, res: NextRequest) {

  const { decodedToken } = await authenticateApiUser();
  if (!decodedToken) {
    return NextResponse.json(
      { error: "decodedToken is missing but there was no earlyResponse" },
      { status: 500 }
    );
  }

  initBackendFirebaseApp();

  let req_json = await req.json();

  const firestore = getFirestore();
  const graphQuery = await firestore
    .collection("graphs")
    .where("user_id", "==", decodedToken.user_id)
    .where("name", "==", req_json.dialogFlow)
    .get();
  const data = graphQuery.docs[0]?.data();
  if (!data) {
    req_json.dialogFlow = null
  } else {
    const graphDoc= { nodes:data.nodes, edges:data.edges, uid: graphQuery.docs[0].id };
    req_json.dialogFlow = compileGraph(graphDoc.nodes, graphDoc.edges);
  }

  const iterator = makeIterator(req_json);
  const stream = await iteratorToStream(iterator);

  return new Response(stream);
}
