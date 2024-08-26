import { z } from "zod";
import { conversationSchema } from "./ConversationSchema";

export const conversationTitleSchema = z.object({
  title: z.string(),
  conversationId: z.string(),
  timestamp: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
});

export const conversationTitleSchemaArray = z.array(conversationSchema);

export type conversationTitleData = z.infer<typeof conversationTitleSchema>;
