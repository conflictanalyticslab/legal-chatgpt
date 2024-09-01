"use server";
import { ChatOpenAI } from "@langchain/openai";
import admin from "firebase-admin";
import { apiErrorResponse } from "@/utils/utils";
import { CONDENSE_QUESTION_PROMPT, OJ_PROMPT } from "@/lib/LLM/prompts";
import {
  RunnableSequence,
  RunnablePassthrough,
} from "@langchain/core/runnables";
import { formatChatHistory, formatDocumentsAsString } from "@/lib/LLM/utils";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { langchainDocType } from "@/models/schema";
import { PineconeIndexes } from "@/app/(private)/chat/enum/enums";
import { NextRequest } from "next/server";
import { getRetriever } from "@/lib/LLM/getRetriever";

const encoder = new TextEncoder();

// https://developer.mozilla.org/docs/Web/API/ReadableStream#convert_async_iterator_to_stream
function iteratorToStream(iterator: any) {
  return new ReadableStream({
    async pull(controller) {
      const { value, done } = await iterator.next();

      if (done) {
        controller.close();
      } else {
        controller.enqueue(value);
      }
    },
  });
}

async function* makeIterator({
  token,
  query,
  namespace = "",
  indexName = PineconeIndexes.staticDocuments,
}: {
  token: string;
  query: string;
  namespace: string;
  indexName: string;
}) {
  try {
    console.log("THE RAG INDEX NAME IS: ", indexName);
    console.log("THE RAG NAMESPACE IS: ", namespace);
    admin.auth().verifyIdToken(token as string);

    //TODO: TESTING PURPOSES REMOVE LATER:
    indexName = PineconeIndexes.staticDocuments;
    namespace = "australian_law";

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

    const { retriever } = await getRetriever();

    let relevantDocs: langchainDocType[] = [];
    // When the sequence reaches the context step, it passes the refined question to the retriever, which automatically performs a semantic search.
    // This chain is used to generate the answer from the LLM using the past conversation information
    const answerChain = RunnableSequence.from([
      {
        context: async (input) => {
          // Invoke the retriever and capture the results
          relevantDocs = (await retriever.invoke(input)) as langchainDocType[];
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

    for await (let chunk of await conversationalRetrievalQAChain.stream({
      question: query as string,
      chat_history: [
        // [
        //   "What is the powerhouse of the cell?",
        //   "The powerhouse of the cell is the mitochondria.",
        // ],
      ],
    })) {
      yield encoder.encode(`${chunk.content}`);
    }
  } catch (error: unknown) {
    return apiErrorResponse(error);
  }
}

export async function POST(req: NextRequest, res: NextRequest) {
  const iterator = makeIterator(await req.json());
  const stream = iteratorToStream(iterator);

  return new Response(stream);
}
