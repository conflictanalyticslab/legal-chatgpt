/**
 * @file: crud_utils.js - generic firebase crud functions
 *
 * @author Kevin Yu <yu.kevin2002@gmail.com>
 * @date Jul 2024
 */

import { apiErrorResponse, ApiResponse } from "@/lib/utils";
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
