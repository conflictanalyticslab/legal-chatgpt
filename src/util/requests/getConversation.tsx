// import ConversationContext from "@/components/Chat/ConversationContext";
import { auth } from "@/firebase";

export async function getConversation(title: string): Promise<{conversation: {role:string, content:string}[], documents: string[], title: string, conversationId: string}> {
  if (!auth.currentUser || title === "") {
    return {conversation: [], documents: [], title: "", conversationId: ""};
  }

  const res = await fetch(`/api/conversation/conversationContent`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${await auth.currentUser?.getIdToken()}`,
    },
    body: JSON.stringify({ title: title}),
  });

  return await res.json();
}
