import { db } from "@/firebase";
import { doc, getDoc, deleteDoc } from "firebase/firestore";


export const deleteDocument = async (documentUid: string): Promise<void> => {
    const docRef = doc(db, "documents/", documentUid);
    console.log("here")
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