import { auth } from "@/firebase";

export async function postConversationTitle(
  fullConversation: object[],
  includedDocuments: string[]
) {

  console.log("here is the full conversation (tiles)", fullConversation)
  return await fetch("/api/conversation/conversationTitle", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${await auth.currentUser?.getIdToken()}`,
    },
    body: JSON.stringify({ fullConversation, includedDocuments }),
  });
}
