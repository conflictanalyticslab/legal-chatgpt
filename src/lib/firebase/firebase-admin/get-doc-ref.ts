/**
 * @file: crud_utils.js - generic firebase crud functions
 *
 * @author Kevin Yu <yu.kevin2002@gmail.com>
 * @date Jul 2024
 */

import { getFirestore } from "firebase-admin/firestore";

/**
 * Fetches doc reference from firestore collection
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

