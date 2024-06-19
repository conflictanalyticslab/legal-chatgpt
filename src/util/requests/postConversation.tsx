import { auth } from "@/firebase";

export async function postConversation(
  searchPrompt: string,
  documentPrompt: string,
  fullConversation: object[]
) {

  console.log("Here is the full conversation ---------> ", fullConversation)
  return await fetch("/api/conversation", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${await auth.currentUser?.getIdToken()}`,
    },
    body: JSON.stringify({ searchPrompt, documentPrompt, fullConversation}),
  });
}
