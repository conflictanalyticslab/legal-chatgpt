/**
 * @file: crud_utils.js - generic firebase crud functions 
 *
 * @author Kevin Yu <yu.kevin2002@gmail.com>
 * @date Jul 2024
 */

import { getFirestore } from "firebase-admin/firestore";


/**
 * Create new document in specified collection
 * 
 * @param collection 
 * @param data 
 */
export async function createDoc(collection:string, data:any) {

  // Generate new document ref
  const docRef = await getFirestore().collection(collection).doc();
  try{
    await docRef.create(data);
    return { success: true };
  } catch(error) {
    console.log(error)
    return { success: false };
  }
}

export async function getDocRef(collection: string, docId: any) {
  try {
    const docRef = await getFirestore().collection(collection).doc(docId);
    return docRef;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function updateDoc(
  docRef: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>,
  data: any
) {
  try {
    await docRef.update(data);
    return { success: true };
  } catch (error) {
    throw error
  }
}