import { auth } from "@/firebase";

export async function postConversationSave(
  fullConversation: object[],
  includedDocuments: string[]
) {
  return await fetch("/api/conversation/save", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${await auth.currentUser?.getIdToken()}`,
    },
    body: JSON.stringify({ fullConversation, includedDocuments }),
  });
}
