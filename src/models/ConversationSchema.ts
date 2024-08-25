import { z } from "zod";

const openAIConversation = z.object({
  role: z.string(),
  content: z.string(),
});

export const conversationSchema = z.object({
  conversation: z.array(openAIConversation),
  includedDocuments: z.array(z.any()),
  userUid: z.string(), // This comes from decoding the user
  title: z.string(),
  timestamp: z.date(),
  updatedAt: z.date(),
  conversationId: z.string(),
});

export const conversationSchemaArray = z.array(conversationSchema);
