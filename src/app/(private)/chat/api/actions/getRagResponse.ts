"use server";
import { ChatOpenAI } from "@langchain/openai";
import { PineconeIndexes } from "../../enum/enums";
import admin from "firebase-admin";
import { apiErrorResponse } from "@/utils/utils";
import { CONDENSE_QUESTION_PROMPT, OJ_PROMPT } from "@/lib/LLM/prompts";
import {
  RunnableSequence,
  RunnablePassthrough,
} from "@langchain/core/runnables";
import { formatChatHistory, formatDocumentsAsString } from "@/lib/LLM/utils";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { langchainPineconeDtoToRelevantDocuments } from "../documents/transform";
import { LangchainDocType } from "@/models/schema";
import { NextApiRequest, NextApiResponse } from "next";
import { getRetriever } from "@/lib/LLM/getRetriever";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let {
    token,
    query,
    namespace = "",
    indexName = PineconeIndexes.staticDocuments,
  } = req.query;

  try {
    console.log("THE RAG INDEX NAME IS: ", indexName);
    console.log("THE RAG NAMESPACE IS: ", namespace);
    admin.auth().verifyIdToken(token as string);

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    // ********************************* LLM INITIALIZATION ********************************* //
    const llm = new ChatOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      model: "gpt-3.5-turbo-0125",
      temperature: 0,
      streaming: true,
    });

    // ********************************* INITIALIZING THE OPENAI AGENT ********************************* //

    type ConversationalRetrievalQAChainInput = {
      question: string;
      chat_history: [string, string][];
    };
    // The prompt has a question and chat_history parameter and we pass arguments to this chain which populates that data in the prompt
    // The parser is what the output of the LLM produces
    // This chain is used to generate a basic question based on the past conversation history
    const standaloneQuestionChain = RunnableSequence.from([
      {
        question: (input: ConversationalRetrievalQAChainInput) =>
          input.question,
        chat_history: (input: ConversationalRetrievalQAChainInput) =>
          formatChatHistory(input.chat_history),
      },
      CONDENSE_QUESTION_PROMPT,
      llm,
      new StringOutputParser(),
    ]);

    const { retriever } = await getRetriever(
      indexName as string,
      namespace as string
    );

    let relevantDocs: LangchainDocType[] = [];
    // When the sequence reaches the context step, it passes the refined question to the retriever, which automatically performs a semantic search.
    // This chain is used to generate the answer from the LLM using the past conversation information
    const answerChain = RunnableSequence.from([
      {
        context: async (input) => {
          // Invoke the retriever and capture the results
          relevantDocs = (await retriever.invoke(input)) as LangchainDocType[];
          // Format the documents as a string for the next step in the sequence
          return formatDocumentsAsString(relevantDocs);
        },
        question: new RunnablePassthrough(),
      },
      OJ_PROMPT,
      llm,
    ]);

    const conversationalRetrievalQAChain =
      standaloneQuestionChain.pipe(answerChain);

    console.log("Message from CHATGPT");
    for await (let chunk of await conversationalRetrievalQAChain.stream({
      question: query as string,
      chat_history: [
        // [
        //   "What is the powerhouse of the cell?",
        //   "The powerhouse of the cell is the mitochondria.",
        // ],
      ],
    })) {
      res.write(`data: ${chunk.content}\n\n`);
    }

    res.write(`data: [DONE]\n\n`);
    res.end();

    // return {
    //   success: true,
    //   error: null,
    //   data: {
    //     llmText: "Check server",
    //     relevantDocs: langchainPineconeDtoToRelevantDocuments(relevantDocs),
    //   },
    // };
  } catch (error: unknown) {
    return apiErrorResponse(error);
  }
}
