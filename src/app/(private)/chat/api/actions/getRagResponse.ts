"use server";
import { OpenAIEmbeddings, ChatOpenAI } from "@langchain/openai";
import { pull } from "langchain/hub";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { Pinecone } from "@pinecone-database/pinecone";
import { PineconeStore } from "@langchain/pinecone";
import { PineconeIndexes } from "../../enum/enums";
import admin from "firebase-admin";
import { apiErrorResponse } from "@/utils/utils";
import { OJ_PROMPT } from "@/lib/LLM/prompts";
import {
  langchainPineconeDtoToRelevantDocuments,
  pineconeDtoToRelevantDocuments,
} from "../documents/transform";
import { retrieveDocs } from "./fetchSemanticSearch";

export async function getRagResponse(
  token: string,
  query: string,
  namespace: string = "",
  indexName = PineconeIndexes.staticDocuments
) {
  try {
    console.log("THE RAG INDEX NAME IS: ", indexName);
    console.log("THE RAG NAMESPACE IS: ", namespace);
    const decodedToken = admin.auth().verifyIdToken(token);

    //TODO: TESTING PURPOSES REMOVE LATER:
    indexName = PineconeIndexes.staticDocuments;
    namespace = "australian_law";

    // ********************************* LLM INITIALIZATION ********************************* //
    const llm = new ChatOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      model: "gpt-3.5-turbo-0125",
      temperature: 0,
    });

    // ********************************* CHAIN THAT IMPLEMENTS RAG ********************************* //
    // Create a chain that passes a list of documents to a model.
    const ragChain = await createStuffDocumentsChain({
      llm,
      prompt: OJ_PROMPT,
      outputParser: new StringOutputParser(),
    });

    // ********************************* DOCUMENT RETRIEVAL ********************************* //
    const retrievedDocs = pineconeDtoToRelevantDocuments(
      await retrieveDocs(query, indexName, namespace, 3)
    );

    // ********************************* INVOKING RAG ********************************* //
    const res = await ragChain.invoke({
      question: query,
      context: retrievedDocs,
    });

    return {
      success: true,
      error: null,
      data: { llmText: res, relevantDocs: retrievedDocs },
    };
  } catch (error: unknown) {
    return apiErrorResponse(error);
  }
}
