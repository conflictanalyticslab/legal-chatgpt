/**
 * @file: crud_utils.js - generic firebase crud functions
 *
 * @author Kevin Yu <yu.kevin2002@gmail.com>
 * @date Jul 2024
 */

import { apiErrorResponse, ApiResponse } from "@/utils/utils";
import { getFirestore } from "firebase-admin/firestore";

/**
 * Create new document in specified collection
 *
 * @param collection
 * @param data
 */
export async function createDoc(
  collection: string,
  data: any
): Promise<ApiResponse<any>> {
  // Generate new document ref
  const docRef = await getFirestore().collection(collection).doc();
  try {
    await docRef.create({ ...data, conversationId: docRef.id });
    return { success: true, error: null, data: docRef.id };
  } catch (error) {
    console.log(error);
    return apiErrorResponse(error);
  }
}

/**
 * Fetches doc from firestore collection
 * @param collection
 * @param docId
 * @returns
 */
export async function getDocRef(collection: string, docId: any) {
  try {
    const docRef = await getFirestore().collection(collection).doc(docId);
    return docRef;
  } catch (error) {
    console.log(error);
    return null;
  }
}

/**
 * General Update document in firestore collection
 * @param docRef
 * @param data
 * @returns
 */
export async function updateDoc(
  docRef: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>,
  data: any
) {
  try {
    await docRef.update(data);
    return { success: true };
  } catch (error) {
    throw error;
  }
}
