import { auth } from "@/firebase";

export async function postConversationMult(fullConversation: object[]) {
    return await fetch("/api/multiplicity", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${await auth.currentUser?.getIdToken()}`,
        },
        body: JSON.stringify({ fullConversation }),
    });
}