import { getFirestore } from "firebase-admin/firestore";

/**
 * Retrieves relevant firestore documents
 * @param documentIds list of document ids that are going to be fetched
 * @returns returns back a snapshot of the queried documents
 */
export async function getDocumentText(
  documentIds: string[]
): Promise<{ name: string; text: string }[]> {

  if (!documentIds || documentIds.length === 0) {
    return [];
  }

  const querySnapshot = await getFirestore().getAll(
    ...documentIds.map((id) => getFirestore().doc(`documents/${id}`))
  );
  return querySnapshot
    .map((doc) => doc.data() || null)
    .filter((doc) => doc != null) as any;
}
