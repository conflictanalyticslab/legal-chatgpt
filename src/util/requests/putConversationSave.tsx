import { auth } from "@/firebase";

export async function putConversationSave(
  uid: string,
  fullConversation: object[],
  includedDocuments: string[],
  title: string
) {
  return await fetch("https://openjustice.ai/.netlify/functions/updateConversation", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${await auth.currentUser?.getIdToken()}`,
    },
    body: JSON.stringify({ uid, fullConversation, includedDocuments, title}),
  });
}
