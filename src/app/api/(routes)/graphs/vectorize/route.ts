import { Document } from "@langchain/core/documents";
import { PineconeStore } from "@langchain/pinecone";
import { NextResponse } from "next/server";
import { initPineconeClient } from "@/app/api/(routes)/graphs/vectorize/init-pinecone-client"
import { getAuthenticatedUser } from "@/lib/auth/get-authenticated-user";
import { GraphFlowNode } from "@/app/features/chat/components/dialog-flows/nodes"
import { embeddings, dimension } from "@/app/api/(routes)/graphs/vectorize/node-embeddings";
import invariant from "tiny-invariant";
        

export async function POST(req: Request) {
  const decodedToken = await getAuthenticatedUser();
  if (decodedToken instanceof NextResponse) return decodedToken;
  if (!decodedToken) {
    return NextResponse.json(
      { success: false, error: "Unauthorized", data: null },
      { status: 401 }
    );
  }
  
  const body = await req.json();
  const dfToVectorize : {[k : string] : GraphFlowNode | null} = body.df;
  
  const indexName = "vectorized-dialogflows";  
  const pc = await initPineconeClient(indexName, dimension);

  const namespace = body.name;  // Note: unlike indexes, namepsaces are created automatically
  const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex: pc.Index(indexName),
    // Maximum number of batch requests to allow at once. Each batch is 1000 vectors.
    maxConcurrency: 5,
    namespace, 
  });
  invariant(vectorStore, "Error occured when attempting to initialize vector DB connection.")


  let questions : {[key : string] : string} = {} // nodeID : question
  for(var key in dfToVectorize){
    if((await fetchNode(key, vectorStore)).length > 0) await vectorStore.delete({ filter: {external_id: key} }); // Delete old copy

    const node = dfToVectorize[key];
    if(node){
      if(node.type == "switch"){
        let mcQuestion = "Select the best response for the following question.\n"

        // LLM should return condition ID as response. 
        // We can then use compiler.ts logic to then find the related edges.
        node.data.conditions.map((e) => {
          mcQuestion += `${e.id}:"${e.body}" \n`
        })
        
        if(node.data.otherwise) mcQuestion += `Otherwise : ${node.data.otherwise.body}`

        questions[key] = mcQuestion;
      } 
      
      try {
        // Only store node data (conditions, thresholds, etc.)
        // Don't store PDF data content as it is already stored in a different index
        const trimmedNode = {
          ...(node.type == "pdf" ? {label : node.data.label} : node.data), 
          type: node.type ? node.type : "undefined"
        };

        // Upsert using nodeId as value to make fetching easier
        const documentNode : Document = {
          id: key, 
          pageContent: key,
          metadata: { 
            external_id: node.id,
            nodeData: JSON.stringify(trimmedNode) 
          }
        }
        await vectorStore.addDocuments([documentNode]);
      } catch (error) {
        const errString = `Failed to vectorize node ${key} : ${error}`;
        console.log(errString);
        return NextResponse.json(
          { success: false, error: errString, data: errString },
          { status: 500 }
        );
      }

    } 
  }

  const mcQuestionId = "MC Questions";
  try{
    await vectorStore.delete({ filter: {external_id: mcQuestionId} });

    // Upsert questions as own vector
    const questionDocument : Document = {
      id: mcQuestionId,
      pageContent: mcQuestionId,
      metadata: { 
        external_id: mcQuestionId,
        mcQuestions: JSON.stringify(questions) 
      }
    }

    await vectorStore.addDocuments([questionDocument]);
  } catch(err){
    console.log(`Failed to vectorize GraphRAG MC Questions: ${err}`)
  }

  // Debug code to test vectorization
  // for(var key in dfToVectorize){
  //   const result = await fetchNode(key, vectorStore);
  //   console.log(key);
  //   console.log(result);
  // }

  // Generic response
  return NextResponse.json({
    success: true,
    error: null,
    data: {},
  });
}

const fetchNode = async (nodeId: string, vectorStore: PineconeStore) => {
  /**
   * A node is always closest to itself in a vector space,
   * so fetch k=1 should always return the desired node
   */
  return await vectorStore.similaritySearch(nodeId, 1); 
}