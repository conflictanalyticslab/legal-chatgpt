import { useChatContext } from "../../store/ChatContext";
import { DocumentQueryOptions, PineconeIndexes } from "../../enum/enums";
// import { getRagResponse } from "../../api/actions/getRagResponse";
import { auth } from "@/lib/firebase/firebase";
import { errorResponse } from "@/utils/utils";
import { useRef } from "react";
import { fetchRelevantDocs } from "../../api/actions/fetchRelevantDocs";

/**
 * Custom hook to fetch data with RAG
 * @returns {Object} hook API
 */
export function useFetchWithRag() {
  const {
    namespace,
    setLoading,
    documentQueryMethod,
    indexName,
    setConversation,
    setRelevantDocs,
    setPdfLoading,
    setInfoAlert,
    generateFlagRef,
    setLatestResponse,
    setDocumentQuery,
  } = useChatContext();

  // Utility function to introduce a delay
  function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Fetch documents using RAG
   * @param fullConversation
   * @param queryInput
   */
  const fetchWithRag = async (fullConversation: any, queryInput: string) => {
    try {
      setLoading(true);
      const userToken = (await auth?.currentUser?.getIdToken()) ?? "";
      // ---------------------------------------------- Generate RAG RESPONSE ---------------------------------------------- //
      const fetchLLMResponse = await fetch("/api/llm/query", {
        method: "POST", // Specify the request method as POST
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: userToken,
          query: queryInput,
          namespace,
          indexName,
        }),
      });

      const fetchRelevantDocsResponse = fetchRelevantDocs(
        userToken,
        queryInput,
        3,
        namespace,
        indexName
      );

      // Use Promise.all to execute both fetch operations concurrently
      const [llmResponse, relevantDocResponse] = await Promise.all([
        fetchLLMResponse,
        fetchRelevantDocsResponse,
      ]);

      setRelevantDocs(relevantDocResponse?.data);

      if (!llmResponse.ok) {
        console.error("Failed to fetch:", llmResponse.statusText);
        throw new Error("Failed to generate llm response");
      }

      const reader = llmResponse?.body?.getReader();
      const decoder = new TextDecoder("utf-8");
      let latestText = "";

      // Function to process each chunk
      const processChunk = async ({
        done,
        value,
      }: {
        done: boolean;
        value?: Uint8Array; // Allow value to be undefined
      }): Promise<void> => {
        if (done) {
          console.log("Stream complete");
          return;
        }

        if (!generateFlagRef.current) return;

        // Decode the chunk from bytes to string
        const chunkText = decoder.decode(value, { stream: true });

        // Split the chunk into words
        const words = chunkText.split(" ");

        // Display each word with a delay
        for (const word of words) {
          latestText += word + " ";
          setLatestResponse(latestText);

          // Introduce a delay between words
          await sleep(30); // Adjust the delay as needed
        }

        // Read the next chunk
        return await reader?.read().then(processChunk);
      };

      // Start reading the stream
      const data = (await reader?.read()) as {
        done: boolean;
        value?: Uint8Array | undefined;
      };
      if (data) await processChunk(data);

      // Add in the content for the LLM's response
      fullConversation[fullConversation.length - 1].content = latestText;
      setLatestResponse("");
      setConversation([...fullConversation]);
      setDocumentQuery(queryInput);
    } catch (error: unknown) {
      setInfoAlert(errorResponse(error));
    } finally {
      setPdfLoading(false);
      setLoading(false);
    }
  };

  return { fetchWithRag };
}
