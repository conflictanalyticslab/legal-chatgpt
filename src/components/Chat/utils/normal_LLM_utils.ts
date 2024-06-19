import { similaritySearch } from "@/app/chat/actions/semantic-search";
import { toast } from "@/components/ui/use-toast";
import { postConversation } from "@/util/requests/postConversation";
import { postSearchTerms } from "@/util/requests/postSearchTerms";
import GPT4Tokenizer from "gpt4-tokenizer";
import { updateConversationTitle } from "./firebase_utils";

export async function fetchWithLLM( documentContent:any, userQuery:string, conversation:any, setConversation:any, setUserQuery:any, num:any, setNum:any, setLoading:any, includedDocuments:any, setAlert:any, generateFlagRef:any, setLatestResponse:any, setPdfQuery:any, setRelevantPDFs:any, setSearchTerm:any, namespace:string, conversationTitle:any, setConversationTitle:any, conversationUid:any, setConversationUid:any, handleBeforeUnload:any) {
  // Adds uploaded document content from user
  const addtionalUploadedDocContent =
    documentContent.length > 0
      ? "\n Here is a document for context: " + documentContent
      : "";

  const queryAndDocContent = userQuery + addtionalUploadedDocContent;

  // Add the user's query to conversation
  const fullConversation = conversation.concat([
    {
      role: "user",
      content: userQuery,
    },
    {
      role: "assistant",
      content: "",
    },
  ]);
  setConversation(fullConversation);
  setUserQuery("");
  setNum(num - 1);

  // ---------------------------------------------- TOKEN LIMIT VERIFICATION ---------------------------------------------- //

  const tokenizer = new GPT4Tokenizer({ type: "gpt3" });
  const estimatedTokenCount = tokenizer.estimateTokenCount(queryAndDocContent);

  // Current limit for tokens we can input
  if (estimatedTokenCount >= 16384) {
    toast({
      title:
        "The input exceeds the token limit, maximum of 16384 tokens in each input, current input contains " +
        estimatedTokenCount +
        " tokens",
      variant: "destructive",
    });
    setLoading(false);
    return;
  }

  let search_terms_res;
  // ---------------------------------------------- AI GENERATED PROMPT? ---------------------------------------------- //
  // Calls postSearchTerms to provide us a structured prompt query query OpenAI's Model
  if (includedDocuments.length === 0) {
    search_terms_res = await postSearchTerms(
      fullConversation,
      includedDocuments,
      false
    );
  } else {
    // uses conversationMult prompt to generate search terms
    search_terms_res = await postSearchTerms(
      fullConversation,
      includedDocuments,
      true
    );
  }
  // Checks if the AI generated search term failed
  if (!search_terms_res.ok) {
    const errorData = await search_terms_res.json();
    setAlert(errorData.error);
    setLoading(false);
    return;
  }

  const { toSearch, searchPrompt, documentPrompt } =
    await search_terms_res.json();

  // ---------------------------------------------- LLM OUTPUT ---------------------------------------------- //
  // Call OpenAI or LLAMA to generate response based on the AI generated prompt
  const response = await postConversation(
    searchPrompt,
    documentPrompt,
    fullConversation
  );
  let buffer = "";

  // The output stream coming from the model
  if (
    response.status === 200 &&
    response.body != null &&
    response.body.constructor === ReadableStream
  ) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");

    // read the response content by iteration
    while (generateFlagRef.current) {
      const currentResponse = await reader.read();

      if (currentResponse.done) {
        break;
      }
      // decode content
      let valueOfCurrentResponse = "";
      valueOfCurrentResponse += decoder.decode(currentResponse.value, {
        stream: true,
      });

      // The data comes back as a serialized string in the format of:
      // 'data: {...}\n\ndata: {...}\n\n'
      const objectsInCurrentResponse = valueOfCurrentResponse
        .split("\n")
        .filter((str) => str !== "");

      for (let i = 0; i < objectsInCurrentResponse.length; i++) {
        try {
          // We substring the first 6 characters (zero indexed) to remove the 'data: ' string prefix
          let object = JSON.parse(objectsInCurrentResponse[i].substring(5));

          if (!generateFlagRef.current) break;

          if (object.hasOwnProperty("choices")) {
            let content = object.choices.at(-1).delta.content;

            if (content == undefined || content == null) {
              continue;
            }

            buffer += content;
            setLatestResponse(buffer);
          }
        } catch (e) {
          continue;
        }
      }
    }

    try {
      generateFlagRef.current = true;
      await reader.cancel();
    } catch (e) {
      console.error("Failed to ccancel reader");
    }
  }
  // If the response is not a readable stream just jsonify it
  else if (response.status === 200 && response.body != null) {
    setLatestResponse(await response.json());
  }

  // Add in the content for the LLM's response
  fullConversation[fullConversation.length - 1].content = buffer;

  setConversation([...fullConversation]); // Have to update its pointer to reset state
  setLatestResponse(""); // Clear buffered response
  setSearchTerm(toSearch); // Update search term for searching relevant pdfs
  setLoading(false);

  // ---------------------------------------------- SEMANTIC SEARCH ---------------------------------------------- //
  setPdfQuery(userQuery);
  const pdfs = await similaritySearch(userQuery, 3, namespace);
  setRelevantPDFs(pdfs.matches);

  // Update Conversation Title
  updateConversationTitle(
    fullConversation,
    includedDocuments,
    setAlert,
    conversationTitle,
    setConversationTitle,
    conversationUid,
    setConversationUid,
    handleBeforeUnload
  );
}