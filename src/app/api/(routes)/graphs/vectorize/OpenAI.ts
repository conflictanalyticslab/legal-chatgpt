import { OpenAIEmbeddings } from "@langchain/openai";

export const embeddings = new OpenAIEmbeddings({
  apiKey: process.env.OPENAI_API_KEY || "",
});

export const dimension = 1536; // Dimensionality of OpenAI embeddings