import { toast } from "@/components/ui/use-toast";
import GPT4Tokenizer from "gpt4-tokenizer";
import { createDocumentPrompt } from "../pdfs/pdf_utils";
import { useChatContext } from "../../store/ChatContext";
import { postConversation } from "@/lib/requests/postConversation";

export function useFetchWithLLM() {
  const {
    setDocumentQuery,
    setLoading,
    includedDocuments,
    setConversation,
    documentContent,
    setUserQuery,
    num,
    setNum,
    generateFlagRef,
    setLatestResponse,
  } = useChatContext();

  const fetchWithLLM = async (fullConversation: any, queryInput:string) => {
    setLoading(true);

    // Adds uploaded document content from user
    const additionalUploadedDocContent =
      documentContent.length > 0
        ? "\n Here is a document for context: " + documentContent
        : "";

    // Combined user query and additional uploaded doc content
    const queryAndDocContent = queryInput + additionalUploadedDocContent;

    // Add the user's query to conversation
    setConversation(fullConversation);
    setDocumentQuery(queryInput); // Update the document search query after pdf
    setUserQuery("");
    setNum(num - 1);

    // ---------------------------------------------- TOKEN LIMIT VERIFICATION ---------------------------------------------- //

    const tokenizer = new GPT4Tokenizer({ type: "gpt3" });
    const estimatedTokenCount =
      tokenizer.estimateTokenCount(queryAndDocContent);

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
      queryInput,
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
        console.error("Failed to cancel reader");
        throw "Failed to cancel reader";
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
  };

  return { fetchWithLLM };
}
