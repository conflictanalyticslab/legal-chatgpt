import { auth } from "@/lib/firebase/firebase";
import { apiErrorResponse } from "@/utils/utils";

export async function getConversation(conversationId: string): Promise<{
  conversation: { role: string; content: string }[];
  documents: string[];
  title: string;
  conversationId: string;
}> {
  try {
    if (!auth.currentUser || !conversationId) {
      return { conversation: [], documents: [], title: "", conversationId: "" };
    } 

    const res = await fetch(`/api/conversation/conversationContent`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${await auth.currentUser?.getIdToken()}`,
      },
      body: JSON.stringify({ conversationId }),
    });

    if (!res.ok) throw new Error("Failed to get conversation titles");
    return await res.json();
  } catch (error) {
    throw error;
  }
}
