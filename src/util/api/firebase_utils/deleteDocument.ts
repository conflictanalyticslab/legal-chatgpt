import { getFirestore, doc, getDoc, deleteDoc } from "firebase/firestore";

const db = getFirestore();

export const deleteDocument = async (documentUid: string): Promise<void> => {
    const docRef = doc(db, "documents/", documentUid);
  
    try {
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
            console.log('No matching document.');
            return;
        }  

        console.log(`Deleting document with ID: ${documentUid}`);
        await deleteDoc(docRef);
        console.log('Document has been deleted.');
    } catch (error) {
        console.error("Error deleting document:", error);
        throw error;
    }
}