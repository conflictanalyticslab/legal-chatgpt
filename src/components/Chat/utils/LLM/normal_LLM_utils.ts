import { toast } from "@/components/ui/use-toast";
import { postConversation } from "@/util/requests/postConversation";
import GPT4Tokenizer from "gpt4-tokenizer";
import { updateConversationTitle } from "../firebase/firebase_utils";
import { createDocumentPrompt, pdfSearch } from "../pdfs/pdf_utils";

export async function fetchWithLLM( documentContent:any, userQuery:string, conversation:any, setConversation:any, setUserQuery:any, num:any, setNum:any, setLoading:any, includedDocuments:any, setAlert:any, generateFlagRef:any, setLatestResponse:any, setDocumentQuery:any, setRelevantDocs:any, setPdfLoading:any, namespace:string, conversationTitle:any, setConversationTitle:any, conversationUid:any, setConversationUid:any, handleBeforeUnload:any, documentQueryMethod:any) {
  // Adds uploaded document content from user
  const addtionalUploadedDocContent =
    documentContent.length > 0
      ? "\n Here is a document for context: " + documentContent
      : "";

  // Combined user query and additional uploaded doc content
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

  // ---------------------------------------------- FETCH UPLOADED DOCUMENT CONTENT ---------------------------------------------- //
  const documentPrompt = await createDocumentPrompt(includedDocuments);

  // ---------------------------------------------- LLM OUTPUT ---------------------------------------------- //

  // Retrieve LLM model output
  const response = await postConversation(
    userQuery,
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

      if (currentResponse.done) break;

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
  } else if (response.status === 200 && response.body != null) {
    // If the response is not a readable stream just jsonify it
    setLatestResponse(await response.json());
  }

  // Add in the content for the LLM's response
  fullConversation[fullConversation.length - 1].content = buffer;

  setConversation([...fullConversation]); // Have to update its pointer to reset state
  setLatestResponse(""); // Clear buffered response
  setLoading(false);

  // ---------------------------------------------- DOCUMENT SEARCH ---------------------------------------------- //
  // Chooses which method we are using to query for the pdf
  pdfSearch(
    documentQueryMethod,
    userQuery,
    namespace,
    setAlert,
    setRelevantDocs,
    setPdfLoading
  );
  setDocumentQuery(userQuery);

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
