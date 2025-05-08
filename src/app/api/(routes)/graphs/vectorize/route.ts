// Pinecone vectorization goes here
import { NextResponse } from "next/server";
import { getFirestore } from "firebase-admin/firestore";
import { Pinecone } from '@pinecone-database/pinecone'

import { getAuthenticatedUser } from "@/lib/auth/get-authenticated-user";
import { initBackendFirebaseApp } from "@/lib/middleware/init-backend-firebase-app";
import { apiErrorResponse } from "@/lib/utils";
import { object } from "zod";

// Initialize Pinecone client 
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY ? process.env.PINECONE_API_KEY : "PINECONE KEY NOT FOUND" });

export async function POST(req: Request) {

  // Check user auth (I think)
  const decodedToken = await getAuthenticatedUser();
  if (decodedToken instanceof NextResponse) return decodedToken;
  if (!decodedToken) {
    return NextResponse.json(
      { success: false, error: "Unauthorized", data: null },
      { status: 401 }
    );
  }
  const user_id = decodedToken.user_id;
  
  const body = await req.json();
  const dfToVectorize = body.dfToVectorize;
  console.log("dialog flow:");
  console.log(dfToVectorize);

  const indexList = await pc.listIndexes();  
  const indexName = "vectorized-dialogflows";

  if(!indexList.indexes || !(indexList.indexes.map((node) => (node.name)).includes(indexName))){
    console.log(`Could not find index '${indexName}' in Pinecone database indexes.`);
    await createVectorizedDFIndex(indexName);
  } else {
    console.log(`Found index '${indexName}' in Pinecone database.`);
  }
  
  // Define graph namespace using graphId.


  // Add graph to namespace.
  for(var key in dfToVectorize){
    console.log(key); // Accurate


  }

  // Generic response
  return NextResponse.json({
    success: true,
    error: null,
    data: {},
  });
}

const createVectorizedDFIndex = async (indexName:string) => {
  console.log(`Creating index ${indexName}...`);
  await pc.createIndexForModel({
    name: indexName,
    cloud: 'aws',
    region: 'us-east-1',
    embed: {
      model: 'llama-text-embed-v2',
      fieldMap: { text: 'chunk_text' },
    },
    waitUntilReady: true,
  });
  console.log(`Created index ${indexName}.`);
}