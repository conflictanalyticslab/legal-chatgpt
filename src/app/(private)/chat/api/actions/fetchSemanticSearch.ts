'use server'
import { Pinecone } from "@pinecone-database/pinecone";
import {Embedder} from "@/app/(private)/chat/utils/embeddings/embeddings"
import { TextMetadata } from "@/types/chat";
import { PineconeIndexes } from "../../enum/enums";
import admin from "firebase-admin";

/**
 * Server Actio
 * 
 * @param query 
 * @param topK 
 * @param namespace 
 * @param indexName 
 * @returns 
 */
export async function fetchSemanticSearch (token:string, query:string, topK:number = 3, namespace='', indexName:string=PineconeIndexes.staticDocuments) {

  console.log("THE SEMANTIC INDEX NAME IS: ", indexName)
  console.log("THE SEMANTIC NAMESPACE IS: ", namespace)
  const decodedToken = admin.auth().verifyIdToken(token);
  
  const pinecone = new Pinecone({
    apiKey: process.env.NEXT_PUBLIC_PINECONE_API_KEY || '',
  });

  const index = pinecone.index<TextMetadata>(indexName).namespace(namespace);
  await Embedder.init();

  // Embed the query
  const queryEmbedding = await Embedder.embed(query);

  // Query the index using the query embedding
  const documentResults = await index.query({
    vector: queryEmbedding.embeddings,
    topK,
    includeMetadata: true,
    includeValues: false,
  });

  return documentResults
}
