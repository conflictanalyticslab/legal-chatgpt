import { auth } from "@/lib/firebase/firebase-admin/firebase";

export async function putConversationSave(
  uid: string,
  fullConversation: object[],
  includedDocuments: string[],
  title: string,
  conversationId:string,
) {
  return await fetch("/api/conversation/update", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${await auth.currentUser?.getIdToken()}`,
    },
    body: JSON.stringify({ uid, conversation: fullConversation, includedDocuments, title, conversationId}),
  });
}
