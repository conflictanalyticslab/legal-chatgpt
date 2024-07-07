import { auth } from "@/firebase";

export async function getConversationTitles(): Promise<string[]> {
  if (!auth.currentUser) {
    return [];
  }

  const res = await fetch(`/api/conversation/conversationTitle`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${await auth.currentUser?.getIdToken()}`,
    },
  });
  const { titles } = await res.json();
  return titles;
}
