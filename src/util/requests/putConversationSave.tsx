import { auth } from "@/firebase";

export async function putConversationSave(
  uid: string,
  fullConversation: object[],
  includedDocuments: string[],
  title: string
) {
  // production endpoint: https://openjustice.ai/.netlify/functions/updateConversation
  // https://deploy-preview-80--cute-sprite-f73207.netlify.app/.netlify/functions/updateConversation
  console.log("finna call")
  return await fetch("/api/conversation/update", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${await auth.currentUser?.getIdToken()}`,
    },
    body: JSON.stringify({ uid, conversation: fullConversation, includedDocuments, title}),
  });
}
