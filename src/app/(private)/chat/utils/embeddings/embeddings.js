import OpenAI from "openai";

/**
 * Utility Class to embed strings
 */
export class Embedder {
    constructor() {
        this.pinecone = null;
    }
    // Initialize the pipeline
    static async init() {
        this.pinecone = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }
    // Embed a single string
    static async embed(text) {
        const result =
          this.pinecone &&
          (await this.pinecone.embeddings.create({
            model: "text-embedding-ada-002",
            input: text,
            encoding_format: "float",
          }));
        return {
            embeddings: result["data"][0]["embedding"],
        };
    }
}

