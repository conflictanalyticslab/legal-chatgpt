import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";
import { Document } from "@langchain/core/documents";
import { PineconeStore } from "@langchain/pinecone";
import { embeddings, dimension } from "./OpenAI";

export const initPineconeStore = async (
  indexName: string,
  namespace: string
) => {
  // Initialize Pinecone client
  // const pc = new PineconeClient({
  //   apiKey: process.env.NEXT_PUBLIC_PINECONE_API_KEY
  //     ? process.env.NEXT_PUBLIC_PINECONE_API_KEY
  //     : "PINECONE KEY NOT FOUND",
  // });

  // Test env
  const pc = new PineconeClient({
  apiKey: process.env.PINECONE_API_KEY
    ? process.env.PINECONE_API_KEY
    : "PINECONE KEY NOT FOUND",
  });


  const indexes = (await pc.listIndexes()).indexes;
  if (!indexes || !indexes.map((idx: any) => idx.name).includes(indexName)) {
    console.log(
      `Could not find index '${indexName}' in vector database indexes.`
    );
    await createVectorizedDFIndex(pc, indexName, dimension);
    console.log(`Created index ${indexName}.`);
  }

  // Note: unlike indexes, namepsaces are created automatically in Pinecone
  const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex: pc.Index(indexName),
    // Maximum number of batch requests to allow at once. Each batch is 1000 vectors.
    maxConcurrency: 5,
    namespace,
  });

  return vectorStore;
};

const createVectorizedDFIndex = async (
  pc: PineconeClient,
  indexName: string,
  dimension: number
) => {
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
    },
  });
};
