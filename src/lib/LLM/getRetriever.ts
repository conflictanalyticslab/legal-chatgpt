import { PineconeStore } from "@langchain/pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";

import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";

export async function getRetriever(
  indexName: string = "legal-pdf-documents",
  namespace: string = "",
  k: number = 3,
) {
  const embeddings = new OpenAIEmbeddings({
    model: "text-embedding-ada-002",
  });

  const pinecone = new PineconeClient({
    apiKey: process.env.NEXT_PUBLIC_PINECONE_API_KEY || "",
  });
  // Will automatically read the PINECONE_API_KEY and PINECONE_ENVIRONMENT env vars

  const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex: pinecone.Index(indexName),
    // Maximum number of batch requests to allow at once. Each batch is 1000 vectors.
    maxConcurrency: 5,
    namespace,
  });

  return {
    retriever: vectorStore.asRetriever({
      k: 3,
    }),
  };
}
