'use server'
import { Pinecone } from "@pinecone-database/pinecone";
import {embedder} from "@/app/chat/components/utils/embeddings/embeddings"
import { TextMetadata } from "@/types/chat";

/**
 * Retrieve relevant pdfs from either CourtListener or Static PDFs from Pinecone
 * 
 * 
 * @param query 
 * @param topK 
 * @param namespace 
 * @param indexName 
 * @returns 
 */
export async function similaritySearch (query:string, topK:number = 3, namespace='', indexName:string='legal-pdf-documents') {
  const pinecone = new Pinecone({
    apiKey: process.env.NEXT_PUBLIC_PINECONE_API_KEY || '',
  });

  const index = pinecone.index<TextMetadata>(indexName).namespace(namespace);
  await embedder.init();

  // Embed the query
  const queryEmbedding = await embedder.embed(query);

  // Query the index using the query embedding
  const documentResults = await index.query({
    vector: queryEmbedding.values,
    topK,
    includeMetadata: true,
    includeValues: false,
  });

  return documentResults
}