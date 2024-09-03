import { langchainPineconeDtoToRelevantDocuments } from "@/app/(private)/chat/api/documents/transform";
import { LangchainDocType } from "@/models/schema";
import { Conversation } from "@/types/chat";
import { UploadedDocument } from "@/types/Document";

export const formatChatHistory = (chatHistory: Conversation[]) => {
  const formattedDialogueTurns = chatHistory.map(
    (dialogue: Conversation) => `${dialogue.role}: ${dialogue.content}}`
  );
  return formattedDialogueTurns.join("\n");
};

export function formatDocumentsAsString(documents: LangchainDocType[]) {
  const serializedDocs = langchainPineconeDtoToRelevantDocuments(documents).map(
    (doc: any) => {
      return `file name: ${doc.fileName} url: ${doc.url} content:${doc.content}`;
    }
  );
  return serializedDocs.join("\n\n");
}

export function formatUploadedDocumentsAsString(documents: UploadedDocument[]) {
  const serializedDocs = documents.map((doc: UploadedDocument) => {
    return `file name: ${doc.name} url: ${doc.name} content:${doc.text}`;
  });
  return serializedDocs.join("\n\n");
}
