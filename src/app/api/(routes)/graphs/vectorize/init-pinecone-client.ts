import { Pinecone as PineconeClient } from '@pinecone-database/pinecone'

export const initPineconeClient = async (indexName: string, dimension: number) => {  
  // Initialize Pinecone client
  const pc = new PineconeClient({ apiKey: process.env.NEXT_PUBLIC_PINECONE_API_KEY ? process.env.NEXT_PUBLIC_PINECONE_API_KEY : "PINECONE KEY NOT FOUND" });
  
  const indexes = (await pc.listIndexes()).indexes;
  if(!indexes || !indexes.map((idx: any) => idx.name).includes(indexName)){
    console.log(`Could not find index '${indexName}' in vector database indexes.`);
    await createVectorizedDFIndex(pc, indexName, dimension);
    console.log(`Created index ${indexName}.`);
  } 

  return pc;
}

const createVectorizedDFIndex = async (pc:PineconeClient, indexName:string, dimension:number) => {
  console.log(`Creating index ${indexName}...`);
  await pc.createIndex({
    name: indexName,
    dimension: dimension, 
    metric: "cosine", // Default for semantic search
    spec: {
      serverless: {
        cloud: "aws", // or "gcp"
        region: "us-east-1",
      },
    }
  });
}