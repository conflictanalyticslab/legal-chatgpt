import { getFirestore } from "firebase-admin/firestore";
import { DecodedIdToken } from "firebase-admin/auth";

/**
 * Load user from Firebase
 * 
 * @param decodedToken 
 * @returns 
 */
export async function loadUser(decodedToken: DecodedIdToken) {
  const userRef = getFirestore().collection("users").doc(decodedToken.uid);
  const userSnapshot = await userRef.get();
  return { userRef, user: userSnapshot.data() };
}
