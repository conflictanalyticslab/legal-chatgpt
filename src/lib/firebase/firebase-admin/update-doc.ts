/**
 * @file: crud_utils.js - generic firebase crud functions
 *
 * @author Kevin Yu <yu.kevin2002@gmail.com>
 * @date Jul 2024
 */

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
