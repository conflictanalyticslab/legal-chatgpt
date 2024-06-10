'use server'
import { Pinecone } from "@pinecone-database/pinecone";
import {embedder} from "@/components/Chat/utils/embeddings"
import { TextMetadata } from "@/types/chat";
export async function similaritySearch (query:string, topK:number = 3) {
  const pinecone = new Pinecone({
    apiKey: process.env.NEXT_PUBLIC_PINECONE_API_KEY || '',
  });

  const indexName = "legal-pdf-documents";
  const index = pinecone.index<TextMetadata>(indexName);
  await embedder.init();

  // Embed the query
  const queryEmbedding = await embedder.embed(query);

  console.log("query",query)

  // Query the index using the query embedding
  const results = await index.query({
    vector: queryEmbedding.values,
    topK,
    includeMetadata: true,
    includeValues: false,
  });
  return results
}