import { auth } from "@/firebase";

export async function postConversationSave(
  fullConversation: object[],
  includedDocuments: string[],
  title: string
) {
  return await fetch("https://openjustice.ai/.netlify/functions/saveConversation", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${await auth.currentUser?.getIdToken()}`,
    },
    body: JSON.stringify({ fullConversation, includedDocuments, title}),
  });
}
