"use server";
import { Pinecone } from "@pinecone-database/pinecone";
import { Embedder } from "@/app/(private)/chat/utils/embeddings/embeddings";
import { TextMetadata } from "@/types/chat";
import { PineconeIndexes } from "../../enum/enums";
import admin from "firebase-admin";
import { apiErrorResponse } from "@/utils/utils";
import { ChatOpenAI } from "@langchain/openai";
import { langchainPineconeDtoToRelevantDocuments } from "../documents/transform";
import { langchainDocType } from "@/models/schema";
import { getRetriever } from "@/lib/LLM/getRetriever";

/**
 * Server Actio
 *
 * @param query
 * @param topK
 * @param namespace
 * @param indexName
 * @returns
 */
export async function fetchRelevantDocs(
  token: string,
  query: string,
  topK: number = 3,
  namespace = "",
  indexName: string = PineconeIndexes.staticDocuments
) {
  try {
    console.log("THE SEMANTIC INDEX NAME IS: ", indexName);
    console.log("THE SEMANTIC NAMESPACE IS: ", namespace);
    admin.auth().verifyIdToken(token);

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
  const { retriever } = await getRetriever(indexName, namespace, topK);
  // Query the index using the query embedding
  const data = langchainPineconeDtoToRelevantDocuments(await retriever.invoke(query) as langchainDocType[]);
  console.log("this is the data",  data)
  return data
}
