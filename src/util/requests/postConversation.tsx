import { auth } from "@/firebase";

export async function postConversation(
  searchPrompt: string,
  documentPrompt: string,
  fullConversation: object[]
) {
  return await fetch("/api/conversation", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${await auth.currentUser?.getIdToken()}`,
    },
    body: JSON.stringify({ searchPrompt, documentPrompt, conversation: fullConversation}),
  });
}
