/**
 * 
 * @param data the data object that is sent to OpenAi
 * @param {boolean} stream indicates whether to retrieve a stream response or not.
 * @returns 
 */
export const queryOpenAi = async (data: any, stream=false) => {
  if (!data.hasOwnProperty("model")) {
    // specifying default gpt model here
    data["model"] = "gpt-3.5-turbo-0125";
  }

  // Generate stream response
  if (!stream) 
    {
    data["stream"] = false;
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify(data),
    });
    const result = await response.json();
    return result;
  } 
  else 
  {
    // Generate Stream Response
    data["stream"] = true;
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify(data),
    });
    return response;
  }
};


/**
 * Query OpenAI's LLM
 * 
 * @returns 
 */
export async function queryOpenAILLM(
  searchPrompt: string,
  documentPrompt: string,
  fullConversation: any
) {
    // Conversation sent by the user is empty
    if (fullConversation.length === 0) {
      return { error: "fullConversation is empty", status: 400 };
    }

    try {
      if (fullConversation.length < 2) return;

      // Sets the user's content prompt
      fullConversation[fullConversation.length - 2].content =
        "Answer in 500 words or less. Short answers are better.\n\n" +
        documentPrompt +
        "\n\n" +
        searchPrompt;


        console.log("Search Prompt", searchPrompt)
        console.log("document promtp",  documentPrompt )
        console.log("full convo",  fullConversation, )

      // Send the full conversation and the
      const llmResponse = await queryOpenAi(
        {
          model: "gpt-3.5-turbo-0125",
          format: "markdown",
          messages: [...fullConversation],
        },
        true
      );
      console.log("AND NOWEWWWWWW: ", llmResponse)


      // Flag to determine whether we need to use LLAMA model
      if (!llmResponse) {
        return null
      }
      return llmResponse;
    } catch (error) {
      return error;
    }
  };