import { auth } from "@/lib/firebase/firebase-admin/firebase";
import { useGlobalContext } from "../../../store/global-context";
import useUpsertConversation from "./use-upsert-conversation";
import { errorResponse } from "@/lib/utils";
import { useFetchLLM } from "@/app/(private)/chat/lib/llm/use-fetch-llm";
import { useGlobalDialogFlowStore } from "../components/dialog-flows/store";

const useFetchQuery = () => {
  const { fetchLLMResponse } = useFetchLLM();
  const { upsertConversation } = useUpsertConversation();
  const {
    setAlert,
    setShowStartupImage,
    setPdfLoading,
    setLoading,
    setUserQuery,
    setConversation,
    conversation,
    setInfoAlert,
    handleBeforeUnload,
    includedDocuments,
    num,
    userScrolling,
  } = useGlobalContext();
  const { compiledDialogFlow } = useGlobalDialogFlowStore();

  const fetchQuery = async (queryInput: string) => {
    // Checks if the user used up their available number of prompts
    if (num <= 0) {
      setInfoAlert("No more prompts available...");
    }

    if (queryInput === "") return;

    // Check for authentication
    if (!auth.currentUser) {
      setAlert("Missing auth.currentUser");
      return;
    }

    userScrolling.current = false;
    setShowStartupImage(false);
    setLoading(true);
    setPdfLoading(true);
    setUserQuery("");

    // Prompts the user from leaving the page before the conversation is complete
    window.addEventListener("beforeunload", handleBeforeUnload);

    try {
      // New full conversation the LLM will add to
      const fullConversation = conversation.concat([
        {
          role: "user",
          content: queryInput,
        },
        {
          role: "assistant",
          content: "",
        },
      ]);

      // Displays the user's query first
      setConversation(fullConversation);

      // Calls LLM to generate response to query
      await fetchLLMResponse(
        fullConversation,
        queryInput,
        includedDocuments,
        compiledDialogFlow?.prompt ?? null
      );
      // Save or update the conversation after calling
      upsertConversation(fullConversation);
    } catch (error: any) {
      setInfoAlert(errorResponse(error));
      setLoading(false);
      setPdfLoading(false);
    }
  };

  return {
    fetchQuery,
  };
};

export default useFetchQuery;


// test-llm-direct.js
const fetch = require('node-fetch');

// Test query
const testQuery = "What is the weather like today?";

async function testLLMAPI() {
  try {
    console.log(`Sending test query: "${testQuery}"`);
    
    // Sample conversation with just the test query
    const conversation = [
      {
        role: "user",
        content: testQuery
      }
    ];
    
    // This example uses OpenAI's API format - adjust for your specific provider
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4', // Replace with your model
        messages: conversation,
        max_tokens: 500,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API request failed: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    console.log('\nResponse from LLM:');
    console.log(data.choices[0].message.content);
    
  } catch (error) {
    console.error('Error testing LLM API:');
  }
}

// Run the test
testLLMAPI();