import { auth } from "@/lib/firebase/firebase-admin/firebase";

export async function postConversationTitle(
  fullConversation: object[],
  includedDocuments: string[]
) {
  return await fetch("/api/conversation/conversation-title", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${await auth.currentUser?.getIdToken()}`,
    },
    body: JSON.stringify({ conversation: fullConversation, includedDocuments }),
  });
}
