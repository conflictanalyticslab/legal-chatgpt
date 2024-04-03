import { auth } from "@/firebase";

export async function postSearchTerms(
  fullConversation: object[],
  includedDocuments: string[],
  isMult: boolean
) {
  return await fetch("/api/conversation/searchTerms", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${await auth.currentUser?.getIdToken()}`,
    },
    body: JSON.stringify({ fullConversation, includedDocuments, isMult }),
  });
}
