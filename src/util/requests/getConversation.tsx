import { auth } from "@/firebase";

export async function getConversation(): Promise<string[]> {
  if (!auth.currentUser) {
    return [];
  }

  const res = await fetch(`/api/conversation/save`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${await auth.currentUser?.getIdToken()}`,
    },
  });
  const { documents } = await res.json();
  return documents;
}
