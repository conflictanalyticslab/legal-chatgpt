import {
  langchainPineconeDtoToRelevantDocuments,
} from "@/app/(private)/chat/api/documents/transform";
import { Document } from "@/types/Document";

export const formatChatHistory = (chatHistory: [string, string][]) => {
  const formattedDialogueTurns = chatHistory.map(
    (dialogueTurn) => `user: ${dialogueTurn[0]}\nassistant: ${dialogueTurn[1]}`
  );
  return formattedDialogueTurns.join("\n");
};

export function formatDocumentsAsString(documents: any) {
  const serializedDocs = langchainPineconeDtoToRelevantDocuments(documents).map(
    (doc: any) => {
      return `file name: ${doc.fileName} url: ${doc.url} content:${doc.content}`;
    }
  );
  return serializedDocs.join("\n\n");
}
