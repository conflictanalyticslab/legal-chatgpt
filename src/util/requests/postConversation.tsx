import { auth } from "@/firebase";

export async function postConversation(
  fullConversation: object[],
  includedDocuments: string[]
) {
  return await fetch("/api/conversation", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${await auth.currentUser?.getIdToken()}`,
    },
    body: JSON.stringify({ fullConversation, includedDocuments }),
  });
}
