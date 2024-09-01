'use server'
import { OpenAIAssistantRunnable } from "langchain/experimental/openai_assistant";
import { OpenAI } from "@langchain/openai";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { AgentExecutor } from "langchain/agents";
import { HumanMessage } from "@langchain/core/messages";
import { apiErrorResponse } from "@/utils/utils";
import { z } from "zod";
import admin from "firebase-admin";

const llm = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4o",
  temperature: 0
});

const multiplyTool = new DynamicStructuredTool({
  name: "multiply",
  description: "multiply two numbers together",
  schema: z.object({
    a: z.number().describe("the first number to multiply"),
    b: z.number().describe("the second number to multiply"),
  }),
  func: async ({ a, b }: { a: number; b: number }) => {
    return (a * b).toString();
  },
});

const nextQuestionTool = new DynamicStructuredTool({
  name: "NextQuestion",
  description: "A tool that generates the next question to ask based on the answer to the previous question",
  schema: z.object({
    graph: z.array(
      z.object({
        question: z.string().describe("A question that can be asked"),
        answer: z.string().describe("A possible answer to the question"),
        nextQuestion: z.string().describe("The next question to ask based on the answer")
      })
    ).describe("A list containing a chain of questions, answers and follow-up questions to ask based on the answer"),
    question: z.string().describe("The question being asked"),
    answer: z.string().describe("The answer to the question"),
  }),
  func: async ({graph, question, answer}) => {
    // I know there's a better way to do this, this is just a prototype
    return await llm.invoke([new HumanMessage(
      "Given the following JSON list that contains 3-tuples representing a chain of questions, answers and follow-up questions: " 
      + graph
      + "\n The last question that was asked was: " + question
      + "\n The answer to the question was: " + answer
      + "\n Only respond with the next question from the list?"
    )])
  }
})

export async function getGraphResponse(token: string, query: string) {
  try{
    const decodedToken = admin.auth().verifyIdToken(token);
    const assistant = await OpenAIAssistantRunnable.createAssistant({
      model: "gpt-4o",
      clientOptions: {
          apiKey: process.env.OPENAI_API_KEY,
      },
      instructions: "You are a legal chatbot that can ask users questions. Only return results from the next question tool",
      tools: [nextQuestionTool],
      asAgent: true,
    });
    const agentExecutor = AgentExecutor.fromAgentAndTools({
      agent: assistant,
      tools: [nextQuestionTool],
    });
    const assistantResponse = await agentExecutor.invoke({
      content: query,
    });
    
    return { success: true, error: null, data: assistantResponse.output };
  } catch(error) {
    return apiErrorResponse(error);
  }
}

