import { auth } from "@/lib/firebase/firebase";

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

  if(!res || !res.ok) throw(new Error("Couldn't retrieve conversation titles"))
  const { titles } = await res.json();
  return titles;
}
