"use server";
import admin from "firebase-admin";
import { apiErrorResponse } from "@/lib/utils";
import { langchainPineconeDtoToRelevantDocuments } from "../dto/transform";
import { getRetriever } from "@/app/features/chat/lib/get-retriever";
import { initBackendFirebaseApp } from "@/lib/middleware/init-backend-firebase-app";
import { PineconeIndexes } from "@/app/(private)/chat/enum/enums";
import { LangchainDocType } from "../models/schema";

/**
 * fe
 *
 * @param query
 * @param topK
 * @param namespace
 * @param indexName
 * @returns
 */
export async function fetchSemanticDocs(
  token: string,
  query: string,
  topK: number = 3,
  namespace = "",
  indexName: string = PineconeIndexes.staticDocuments
) {
  try {
    console.log("THE SEMANTIC INDEX NAME IS: ", indexName);
    console.log("THE SEMANTIC NAMESPACE IS: ", namespace);

    // change the following to process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT when deploying to production
    initBackendFirebaseApp()
    // Authenticate User
    admin.auth().verifyIdToken(token);

    return {
      success: true,
      error: null,
      data: await retrieveDocs(query, indexName, namespace, topK),
    };
  } catch (error) {
    return apiErrorResponse(error);
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
  const data = langchainPineconeDtoToRelevantDocuments(
    (await retriever.invoke(query)) as LangchainDocType[]
  );
  return data;
}
