import { Document } from "@langchain/core/documents";
import { VectorStore } from "@langchain/core/vectorstores";
import { initPineconeStore } from "@/app/api/(routes)/graphs/vectorize/PineconeStore";
import { initBackendFirebaseApp } from "@/lib/middleware/init-backend-firebase-app";
import { getAuthenticatedUser } from "@/lib/auth/get-authenticated-user";
import { GraphFlowNode, GraphFlowEdge } from "@/app/features/chat/components/dialog-flows/nodes";
import { graphRagPrompt } from "./Prompt";
import invariant from "tiny-invariant";

import { FieldPath, getFirestore } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { getDocumentText } from "@/lib/firebase/client/get-documents";
import { apiErrorResponse } from "@/lib/utils";


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
  const dfToVectorize: {[k: string]: 
    {
      node: GraphFlowNode, 
      dependencies: GraphFlowEdge[], 
      dependents:GraphFlowEdge[]} | null 
    } = body.df;

  const indexName = "vectorized-dialogflows";
  const vectorStore = await initPineconeStore(indexName, body.name);
  invariant(
    vectorStore,
    "Error occured when attempting to initialize vector DB connection."
  );

  let questions: { [key: string]: string } = {}; // nodeID : question
  for (var key in dfToVectorize) {
    if ((await fetchNode(key, vectorStore)).length > 0)
      await vectorStore.delete({ filter: { external_id: key } }); // Delete old copy

    const node = dfToVectorize[key]?.node;

    if (node) {
      if (node.type == "switch") {
        let mcQuestion =
          "Select the best response for the following question.\n";

        // LLM should return condition ID as response.
        // We can then use compiler.ts logic to then find the related edges.
        node.data.conditions.map((e) => {
          mcQuestion += `${e.id}:"${e.body}" \n`;
        });

        if (node.data.otherwise)
          mcQuestion += `Otherwise : ${node.data.otherwise.body}`;

        questions[key] = mcQuestion;
      }

      try {
        // Only store node data (conditions, thresholds, etc.)
        // Don't store PDF data content as it is already stored in a different index
        const trimmedNode = {
          ...(node.type == "pdf" ? { label: node.data.label } : {data: node.data}),
          type: node.type ? node.type : "undefined",
        };

        // Upsert using nodeId as value to make fetching easier
        const documentNode: Document = {
          id: key,
          pageContent: key,
          metadata: {
            external_id: node.id,
            nodeData: JSON.stringify(trimmedNode),
            dependencies: JSON.stringify(dfToVectorize[key]?.dependencies),
            dependents: JSON.stringify(dfToVectorize[key]?.dependents)
          },
        };
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
  try {
    await vectorStore.delete({ filter: { external_id: mcQuestionId } });

    // Upsert questions as own vector
    const questionDocument: Document = {
      id: mcQuestionId,
      pageContent: mcQuestionId,
      metadata: {
        external_id: mcQuestionId,
        mcQuestions: JSON.stringify(questions),
      },
    };

    await vectorStore.addDocuments([questionDocument]);
  } catch (err) {
    console.log(`Failed to vectorize GraphRAG MC Questions: ${err}`);
  }

  // Debug code to test vectorization
  // for(var key in dfToVectorize){
  //   const result = await fetchNode(key, vectorStore);
    // console.log(key);
    // console.log(result);
  // }
  
  

  // Generic response
  return NextResponse.json({
    success: true,
    error: null,
    data: {},
  });
}

const fetchNode = async (nodeId: string, vectorStore: VectorStore) => {
  /**
   * A node is always closest to itself in a vector space,
   * so fetch k=1 should always return the desired node
   */

  return (await vectorStore.similaritySearch(nodeId, 1));
};

/**
 * Compilation: step
 * it's going to be very similar to DF 1.0, 
 * the only difference is instead of being given a full context, 
 * you're given a list of ids for documents on pinecone
 * and you use that to form an answer
 * 
 * you want to return a data structure that shows:
 * A clear answer that preferably follow the format and a similar prompt to the current llm prompt
 * Answer in chunks, each chunks tied to the id of where that information came from
 * 
 * TODO: Feed an example traversal to leaf into an LLM + an example user question, examine response vs. current OJ 
 */
/**
 * 
 * @param dfId 
 * @param externalIds Ids of nodes used, in order of intended traversal.
 * @param vectorStore 
 * @returns 
 */
const compilation = async (dfId:string, query:string, externalIds: string[], vectorStore: VectorStore) => {
    initBackendFirebaseApp();
    const firestore = getFirestore();

    const doc = await firestore.collection("graphs").doc(dfId).get();
    invariant(doc, "Could not find the graph.");

    const { _, ...data } = doc.data()!;

    const pdfNodes = data.nodes.filter((node:GraphFlowNode) => node.type == "pdf");

    let prompts = [];
    const describeRelationships = (edges: GraphFlowEdge[]) => edges.map((e) => e.data?.body ? `Node ${e.source} (${e.data.body})` : `Node ${e.source}`).join(", ");

    for(let i=0; i<externalIds.length; i++){
        const nodeId = externalIds[i];

        const res = await fetchNode(nodeId, vectorStore);

        // Only parse DF nodes
        if(res[0].metadata.nodeData){
            const node: GraphFlowNode = JSON.parse(res[0].metadata.nodeData);
            const dependencies: GraphFlowEdge[] = JSON.parse(res[0].metadata.dependencies);
            const dependents: GraphFlowEdge[] = JSON.parse(res[0].metadata.dependents);

            invariant((typeof node.type) == "string", "Node type is not string.");

            switch (node.type) {
            case "example": {
                const prompt = [
                `--------Node ${i+1}--------`,
                `id: ${nodeId}`,
                `type: ${node.type}`,
                `data: {`,
                `   "label": ${node.data.label}`,
                `   "body": An example of node ${i}: ${node.data.body}`,
                '}'
                ];
                prompts.push(prompt.join("\n"));
                break;
            }
            case "instruction": {
                const prompt = [
                `--------Node ${i+1}--------`,
                `id: ${nodeId}`,
                `type: ${node.type}`,
                `data: {`,
                `   "label": ${node.data.label}`,
                `   "body": You must follow these instructions: ${node.data.body}`,
                `}`
                ];
                prompts.push(prompt.join("\n"));
                break;
            }
            case "context": {
                const prompt = [
                `--------Node ${i+1}--------`,
                `id: ${nodeId}`,
                `type: ${node.type}`,
                `data: {`,
                `   "label": ${node.data.label}`,
                `   "body": ${node.data.body}`,
                '}'
                ];
                prompts.push(prompt.join("\n"));
                break;
            }
            case "switch": {
                if(i+1 < externalIds.length){
                  const nextNodeId = externalIds[i+1];
                  const conditionEdges = dependents.filter((e) => e.target == nextNodeId);
                  const matchingCondition = node.data.conditions.find((c) =>
                    conditionEdges.some((edge: GraphFlowEdge) => edge.sourceHandle === c.id)
                  );
                  if(matchingCondition){
                      const prompt = [
                    `--------Node ${i+1}--------`,
                    `id: ${nodeId}`,
                    `type: "context"`,
                    `data: {`,
                    `   "label": ${matchingCondition.label}`,
                    `   "body": ${matchingCondition.body}`,
                    `}`
                    ];
                    
                    prompts.push(prompt.join("\n"))
                  } else {
                    console.log("/api/graphs/vectorize: Switch node could not find final path when performing prompt compilation.");
                  }

                } else {
                  const prompt = [
                  `--------Node ${i+1}--------`,
                  `id: ${nodeId}`,
                  `type: ${node.type}`,
                  `data: {`,
                  `   "label": Apply these conditions.`,
                  `   "body": ${node.data.conditions.map((c) => `${c.label}: ${c.body}`).join(" ")}`,
                  `}`
                  ];
                  
                  prompts.push(prompt.join("\n"));

                }
                break;
            }
            case "relevant": {
                const isRelevantEdges = dependents.filter((e) => e.sourceHandle === "relevant");
                const isNotRelevantEdges = dependents.filter((e) => e.sourceHandle === "notRelevant");
                const prompt = [
                `--------Node ${i+1}--------`,
                `id: ${nodeId}`,
                `type: ${node.type}`,
                `data: {`,
                `   "label": ${node.data.label}`,
                `   "body": When ${describeRelationships(dependencies)} is relevant, you should refer to ${describeRelationships(isRelevantEdges)}`,
                `         The threshold for relevance is ${node.data.threshold}%`,
                `         Otherwise, you should refer to ${describeRelationships(isNotRelevantEdges)}`,
                `}`
                ];
                prompts.push(prompt.join("\n"));
                break;
            }
            case "keyword-extractor": {
                const prompt = [
                `--------Node ${i+1}--------`,
                `id: ${nodeId}`,
                `type: ${node.type}`,
                `data: {`,
                `   "label": Extract keywords from ${describeRelationships(dependencies)}`,
                `}`
                ];
                prompts.push(prompt.join("\n"));
                break;
            }
            case "pdf": {
                const originalNode = pdfNodes.filter((node:GraphFlowNode) => node.id == nodeId);
                if(originalNode.length > 0){
                  const prompt = [
                      `id: ${nodeId}`,
                      `type: "context"`,
                      `data: {`,
                      `   "label": "Content from ${originalNode[0].data.label} file"`,
                      `   "body": ----- FILE BEGIN -----`,
                      `${originalNode[0].data.content}`,
                      `----- FILE END -----`,
                      '}'
                  ];
                  prompts.push(prompt.join("\n"));
                }
                break;
            }
            case "ghost":
                break;
            default: {
                throw new Error(`Unhandled node type: ${node.type}`);
            }
            }
        }   
    }

    const finalPrompt = `Query: ${query}
Legal_Workflow:${prompts.join("\n")}`

    console.log(finalPrompt);

    // Query openai, system & user
    const response = "";

    return response;
}