'use server'
import { OpenAIAssistantRunnable } from "langchain/experimental/openai_assistant";

export async function getRagResponse(graph: string) {
  try{

    const assistant = await OpenAIAssistantRunnable.createAssistant({
        model: "gpt-3.5-turbo-0125",
        clientOptions: {
            apiKey: process.env.OPENAI_API_KEY,
        },
        instructions: "You are a legal assistant chat bot that asks questions based on the user's answers. The first item in the list defines the first question to ask."
      });
      const assistantResponse = await assistant.invoke({
        content: graph,
      });
    
    return { ok: true, data: assistantResponse};
  } catch(error) {
    return {ok: false }
  }
}

