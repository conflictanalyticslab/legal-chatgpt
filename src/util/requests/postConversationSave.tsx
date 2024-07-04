import { auth } from "@/firebase";

/**
 * Note: Remember to change the URL to the 
 * 
 * @param fullConversation 
 * @param includedDocuments 
 * @param title 
 * @returns 
 */
export async function postConversationSave(
  fullConversation: object[],
  includedDocuments: string[],
  title: string
) {
  // production endpoint: https://openjustice.ai/.netlify/functions/saveConversation
  // TODO: Note this is a staging deploy link which most likely will cause sometype of cors error
  // Original: https://deploy-preview-80--cute-sprite-f73207.netlify.app/.netlify/functions/saveConversation
  // /api/conversation/conversationTitle
  console.log("\n ---------------------------- HERE ---------------------------- \n")
  return await fetch("/api/conversation/conversationTitle", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${await auth.currentUser?.getIdToken()}`,
    },
    body: JSON.stringify({ fullConversation, includedDocuments, title}),
  });
}
