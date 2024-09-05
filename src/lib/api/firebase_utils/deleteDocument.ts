import { db } from "@/lib/firebase/firebase";
import { doc, getDoc, deleteDoc } from "firebase/firestore";


export const deleteDocument = async (documentUid: string): Promise<void> => {
    const docRef = doc(db, "documents/", documentUid);
    try {
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
            console.log('No matching document.');
            return;
        }  

        await deleteDoc(docRef);
    } catch (error) {
        console.error("Error deleting document:", error);
        throw error;
    }
}
