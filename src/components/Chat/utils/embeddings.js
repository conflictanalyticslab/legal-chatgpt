import { v4 as uuidv4 } from "uuid";
import OpenAI from "openai";


class Embedder {
    constructor() {
        this.pinecone = null;
    }
    // Initialize the pipeline
    async init() {
        this.pinecone = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }
    // Embed a single string
    async embed(text) {
        const result = this.pinecone &&
            (await this.pinecone.embeddings.create({
                model: "text-embedding-ada-002",
                input: text,
                encoding_format: "float",
            }));
        return {
            id: uuidv4(),
            metadata: {
                chunk: 1,
                fileName: '',
                url: '',
                text,
            },
            values: result["data"][0]["embedding"],
        };
    }
}
const embedder = new Embedder();
export { embedder };
