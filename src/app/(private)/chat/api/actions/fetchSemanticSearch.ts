"use server";
import { Pinecone } from "@pinecone-database/pinecone";
import { Embedder } from "@/app/(private)/chat/utils/embeddings/embeddings";
import { TextMetadata } from "@/types/chat";
import { PineconeIndexes } from "../../enum/enums";
import admin from "firebase-admin";
import { apiErrorResponse } from "@/utils/utils";

/**
 * Server Actio
 *
 * @param query
 * @param topK
 * @param namespace
 * @param indexName
 * @returns
 */
export async function fetchSemanticSearch(
  token: string,
  query: string,
  topK: number = 3,
  namespace = "",
  indexName: string = PineconeIndexes.staticDocuments
) {
  try {
    console.log("THE SEMANTIC INDEX NAME IS: ", indexName);
    console.log("THE SEMANTIC NAMESPACE IS: ", namespace);
    const decodedToken = admin.auth().verifyIdToken(token);

    return {
      success: true,
      error: null,
      data: await retrieveDocs(query, indexName, namespace, topK),
    };
  } catch (error) {
    apiErrorResponse(error);
  }
}

export async function retrieveDocs(
  query: string,
  indexName: string,
  namespace: string,
  topK: number
) {
  const pinecone = new Pinecone({
    apiKey: process.env.NEXT_PUBLIC_PINECONE_API_KEY || "",
  });

  const index = pinecone.index<TextMetadata>(indexName).namespace(namespace);
  await Embedder.init();

  // Embed the query
  const queryEmbedding = await Embedder.embed(query);

  // Query the index using the query embedding
  return await index.query({
    vector: queryEmbedding.embeddings,
    topK,
    includeMetadata: true,
    includeValues: false,
  });
}
