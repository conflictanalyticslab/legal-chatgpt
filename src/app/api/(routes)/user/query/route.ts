import { NextResponse } from "next/server";
import { getFirestore } from "firebase-admin/firestore";
import { authenticateApiUser } from "@/lib/middleware/authenticate-api-user";
import { initBackendFirebaseApp } from "@/lib/middleware/init-backend-firebase-app";

import { apiErrorResponse } from "@/lib/utils";
import { useFetchLLM } from "@/app/(private)/chat/lib/llm/use-fetch-llm";
import { compileGraph } from "@/app/features/chat/components/dialog-flows/compiler";

// Get all documents owned by the user in the authentication header
export async function GET(
    _: Request,
    { params }: { params: Promise<{ query: string, includedDocumentIds:Array<string>, dialogFlowId:string }> }
  ) {
  // Authenticates user
  const { decodedToken } = await authenticateApiUser();
  if (!decodedToken) {
    return NextResponse.json(
      { error: "decodedToken is missing but there was no earlyResponse" },
      { status: 500 }
    );
  }

  const { query, includedDocumentIds, dialogFlowId } = await params;

  initBackendFirebaseApp();
  const firestore = getFirestore();

  try {
    const graphQuery = await firestore
      .collection("graphs")
      .where("userUid", "==", decodedToken.user_id)
      .where("id", "==", dialogFlowId)
      .get();
    const graphDoc = graphQuery.docs.map((doc) => {
      const data = doc.data();
      return { nodes:data.nodes, edges:data.edges, uid: doc.id };
    });

    const compiledGraph = compileGraph(graphDoc[0].nodes, graphDoc[0].edges);

    const { fetchLLMResponse } = useFetchLLM();

    const fullConversation = [
      {
        role: "user",
        content: query,
      },
      {
        role: "assistant",
        content: "",
      },
    ];

    await fetchLLMResponse(
      fullConversation,
      query,
      includedDocumentIds,
      compiledGraph ?? null
    );
    
  } catch (error: unknown) {
    return NextResponse.json(apiErrorResponse(error), { status: 500 });
  }
}