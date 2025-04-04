import { getFirestore } from "firebase-admin/firestore";

export async function newDocument(text: string, name: string, userUid: string) {
  const docRef = getFirestore().collection("documents").doc();
  try {
    const newDoc = {
      userUid,
      text,
      name,
    };
    await docRef.set(newDoc);
    return {
      uid: docRef.id,
      ...newDoc,
    };
  } catch (error) {
    console.error("Error creating document:", error);
    throw error;
  }
}
