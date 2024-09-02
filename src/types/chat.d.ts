export type TextMetadata = {
  chunk: number;
  fileName: string;
  url: string;
  text: string;
};

// Conversation Firestore Document Type
export type ConversationDoc = {
  conversation: Conversation;
  documents: string[];
  title: string;
  userId: string;
};

export type Conversation = {
  content: string;
  role: string;
};

export type ApiResponse<T> = {
  success: boolean;
  error?: string | null;
  data: T | null;
};

export type ConversationalRetrievalQAChainInput = {
  question: string;
  chat_history: Conversation[];
};
