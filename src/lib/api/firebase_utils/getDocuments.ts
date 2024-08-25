"use server";
import { getFirestore } from "firebase-admin/firestore";
import admin from "firebase-admin";

/**
 * Retrieves relevant firestore documents
 * @param documentIds list of document ids that are going to be fetched
 * @returns returns back a snapshot of the queried documents
 */
export async function getDocumentText(
  token: string,
  documentIds: string[]
): Promise<{ name: string; text: string }[] | Error> {
  try {
    const decodedToken = admin.auth().verifyIdToken(token);

    if (!documentIds || documentIds.length === 0) {
      return [];
    }

    const querySnapshot = await getFirestore().getAll(
      ...documentIds.map((id) => getFirestore().doc(`documents/${id}`))
    );

    return querySnapshot
      .map((doc) => doc.data() || null)
      .filter((doc) => doc != null) as any;
  } catch (error) {
    return new Error("Invalid Credentials");
  }
}
