import { auth } from "@/firebase";

export async function postConversationSave(
  fullConversation: object[],
  includedDocuments: string[],
  title: string,
) {
  const id_token = await auth.currentUser?.getIdToken();
  return await fetch("/api/conversation/save", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${await id_token}`,
    },
    body: JSON.stringify({ fullConversation, includedDocuments, title, id_token}),
  });
}
