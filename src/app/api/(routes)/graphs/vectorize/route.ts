import { NextResponse } from "next/server";
import { Pinecone } from '@pinecone-database/pinecone'
import { getAuthenticatedUser } from "@/lib/auth/get-authenticated-user";
import { GraphFlowEdge } from "@/app/features/chat/components/dialog-flows/nodes";

type Embedding = {
  values: number[],
  vectorType: 'dense' | 'sparse'
}

type Node = {
  graphId: string;
  label: string;
  specialInfo: any; 
  dependencies: GraphFlowEdge[];
  dependents: GraphFlowEdge[];
};

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
  
  const body = await req.json();
  const dfToVectorize : {[k : string] : Node} = body.dfToVectorize;

  const indexList = await pc.listIndexes();  
  const indexName = "vectorized-dialogflows";

  // Pinecone connection debug
  if(!indexList.indexes || !(indexList.indexes.map((node) => (node.name)).includes(indexName))){
    console.log(`Could not find index '${indexName}' in Pinecone database indexes.`);
    await createVectorizedDFIndex(indexName);
  }

  const namespace = pc.index(indexName).namespace(Object.values(dfToVectorize)[0].graphId);

  let questions : {[key : string] : string} = {} // nodeID : question
  for(var key in dfToVectorize){
    const node = dfToVectorize[key];
    if(node.label == "switch"){
      let mcQuestion = "Select the best response from the following.\n"

      Object.entries(node.specialInfo.conditions).forEach(([key, value], index) => {
        mcQuestion += `${index}: "${key}" \n`; // Use the key from the dictionary
      });

      if(node.specialInfo.otherwise.continue){
        mcQuestion += `${node.specialInfo.conditions.length}: "${node.specialInfo.information}"\n`; 
      } else {
        mcQuestion += `${node.specialInfo.conditions.length}: "None of the above."\n`; 
      }
      questions[key] = mcQuestion;
    } 
    
    try {
      const embedding = await vectorizeString(node.label)

      await namespace.upsert([{
        id: key,
        values: embedding.values,
        metadata:{
          // General node info
          label: node.label,
            // To get edge info, use JSON.parse()
          dependencies : JSON.stringify(node.dependencies),
          dependents: JSON.stringify(node.dependents),

          // Special info, encoded in string format to cooperate with pinecone
            // To get edge info, use JSON.parse()
          specialInfo: JSON.stringify(node.specialInfo)
        }
      }]);

    } catch (error) {
      const errString = `Failed to upsert node ${key} : ${error}`;
      console.log(errString);
      return NextResponse.json(
        { success: false, error: errString, data: errString },
        { status: 500 }
      );
    }
  }

  // Upsert questions as own vector
  const questionEmbedding = await vectorizeString("MC Questions");
  await namespace.upsert([{
    id: "MC Questions",
    values: questionEmbedding.values,
    metadata:{
      /**
       * When fetching & traversing a DF, users should recombine the following to get the questions.
       * Pinecone doesn't allow direct uploads of dictionaries as metadata
       * 
       * Note that MC choice i corresponds to i'th first array of outgoing edges
       * Index out of bounds = DF Leaf and/or End of Traversal
       */
      questions: JSON.stringify(questions)
    }
  }]);

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

const vectorizeString = async (input:string) => {
  const embeddings = await pc.inference.embed(
    'multilingual-e5-large',
    [input],
    { inputType: 'query', truncate: 'END' }
  )

  return embeddings.data[0] as Embedding
}