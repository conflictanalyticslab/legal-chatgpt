import { getFirestore, doc, getDoc, updateDoc} from "firebase/firestore";

const db = getFirestore();

export const editDocument = async (documentUid: string, newContent: string): Promise<void> => {
    const docRef = doc(db, "documents/", documentUid);
  
    try {
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
            console.log('No matching document.');
            return;
        }  

        await updateDoc(docRef, { text: newContent });
    } catch (error) {
        console.error("Error deleting document:", error);
        throw error;
    }
}
