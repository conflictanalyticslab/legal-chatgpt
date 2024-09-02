"use server";
import { getFirestore } from "firebase-admin/firestore";
import admin from "firebase-admin";
import { apiErrorResponse, ApiResponse } from "@/utils/utils";
import { UploadedDocument } from "@/types/Document";

/**
 * Retrieves relevant firestore documents
 * @param documentIds list of document ids that are going to be fetched
 * @returns returns back a snapshot of the queried documents
 */
export async function getDocumentText(
  documentIds: string[]
): Promise<ApiResponse<UploadedDocument[]>> {
  if (!documentIds || documentIds.length === 0) {
    return { success: true, error: null, data: [] };
  }

  const querySnapshot = await getFirestore().getAll(
    ...documentIds.map((id) => getFirestore().doc(`documents/${id}`))
  );

  return {
    success: true,
    error: null,
    data:
      (querySnapshot
        .map((doc) => doc.data() || null)
        .filter((doc) => doc != null) as UploadedDocument[]) ?? [],
  };
}
