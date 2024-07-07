import { auth } from "@/firebase";

export async function postConversationTitle(
  fullConversation: object[],
  includedDocuments: string[]
) {

  return await fetch("/api/conversation/conversationTitle", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${await auth.currentUser?.getIdToken()}`,
    },
    body: JSON.stringify({ conversation: fullConversation, includedDocuments }),
  });
}
