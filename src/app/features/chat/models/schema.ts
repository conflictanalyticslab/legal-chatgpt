import { z } from "zod";

// #region OpenAI
const openAIConversation = z.object({
  role: z.string(),
  content: z.string(),
});

// #region Conversations
export const conversationSchema = z.object({
  conversation: z.array(openAIConversation),
  includedDocuments: z.array(z.any()),
  userUid: z.string(), // This comes from decoding the user
  title: z.string(),
  timestamp: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
  conversationId: z.string(),
});

export const conversationSchemaArray = z.array(conversationSchema);

// #region Conversation Titles
export const conversationTitleSchema = z.object({
  title: z.string(),
  conversationId: z.string(),
  timestamp: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
});

export const conversationTitleSchemaArray = z.array(conversationSchema);
export type conversationTitleData = z.infer<typeof conversationTitleSchema>;

// #region User
export const userSchema = z.object({
  email: z.string(),
  prompts_allowed: z.number(),
  prompts_left: z.number(),
  role: z.string(),
  verified: z.boolean(),
});

// #region Langchain Docs
export const langchainDoc = z.object({
  pageContent: z.string(),
  metadata: z.object({
    chunk: z.number(),
    fileName: z.string(),
    url: z.string(),
  }),
});

export type LangchainDocType = z.infer<typeof langchainDoc>;
