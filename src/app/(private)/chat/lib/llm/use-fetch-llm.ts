import { useGlobalContext } from "../../../../store/global-context";
import { errorResponse } from "@/lib/utils";
import { PineconeNamespaces } from "@/app/(private)/chat/enum/enums";
import { UploadedDocument } from "@/app/features/chat/models/types";
import { usePdfSearch } from "@/app/features/chat/hooks/use-pdf-search";
import { auth } from "@/lib/firebase/firebase-admin/firebase";
import { list } from "postcss";

/**
 * Custom hook to fetch data with RAG
 * @returns {Object} hook API
 */
export function useFetchLLM() {
  const {
    namespace,
    setLoading,
    indexName,
    setConversation,
    setPdfLoading,
    setInfoAlert,
    generateFlagRef,
    setLatestResponse,
    setDocumentQuery
  } = useGlobalContext();
  const { pdfSearch } = usePdfSearch();

  // Utility function to introduce a delay
  function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Fetch documents using RAG
   * @param fullConversation
   * @param queryInput
   */
  const fetchLLMResponse = async (
    fullConversation: any,
    queryInput: string,
    includedDocuments: Array<string>,
    dialogFlow: string | null
  ) => {
    try {
      generateFlagRef.current = true;
      setLoading(true);

      // const userToken = (await auth?.currentUser?.getIdToken()) ?? "";
      // ---------------------------------------------- Generate RAG RESPONSE ---------------------------------------------- //

      // Assign the LLM Response and pdf search promises to variables to be called concurrently
      const llmPromise = fetch("/api/llm/query", {
        method: "POST", // Specify the request method as POST
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await auth.currentUser?.getIdToken()}`,
        },

        body: JSON.stringify({
          query: queryInput,
          namespace,
          indexName,
          fullConversation,
          includedDocuments,
          dialogFlow
        }),
      });

      const relevantDocPromise =
        namespace === PineconeNamespaces.no_dataset
          ? new Promise((resolve, reject) => resolve(true))
          : pdfSearch(queryInput, namespace);

      // Use Promise.all to wait for both the LLM response and semantic search documents to complete
      const [llmResponse, _relevantDocResponse] = await Promise.all([
        llmPromise,
        relevantDocPromise,
      ]);

      if (!llmResponse.ok) throw new Error("Failed to generate llm response");

      // ******************* Start LLM Streaming ******************* //

      // Initialize reader and decoder
      const reader = llmResponse?.body?.getReader();
      const decoder = new TextDecoder("utf-8");
      let latestText = "";

      // Function to process each chunk of the LLM response
      const processChunk = async ({
        done,
        value,
      }: {
        done: boolean;
        value?: Uint8Array; // Allow value to be undefined
      }): Promise<void> => {
        if (done) return;

        // Stops the LLM output generation when the user presses stop
        if (!generateFlagRef.current) return;

        // Decode the chunk from bytes to string
        const chunkText = decoder.decode(value, { stream: true });

        // Split the chunk into words
        const words = chunkText.split(" ");

        // Display each word with a delay
        for (let i = 0; i < words.length; i++) {
          if (i < words.length - 1)
            latestText += words[i] === "" ? " " : words[i] + " ";
          else latestText += words[i];

          setLatestResponse(latestText);
          if (!generateFlagRef.current) return;

          // Introduce a delay between words
          await sleep(20); // Adjust the delay as needed
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

      if (latestText === "")
        throw new Error(
          "Something went wrong. LLM failed to generate response. Please try again."
        );

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

  return { fetchLLMResponse };
}
