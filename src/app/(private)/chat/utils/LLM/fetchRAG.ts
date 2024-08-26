import { useChatContext } from "../../store/ChatContext";
import { DocumentQueryOptions, PineconeIndexes } from "../../enum/enums";
import { getRagResponse } from "../../api/actions/getRagResponse";
import { auth } from "@/lib/firebase/firebase";

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
    enableRag,
    setRelevantDocs,
    setPdfLoading
  } = useChatContext();

  /**
   * Fetch documents using RAG
   * @param fullConversation
   * @param queryInput
   */
  const fetchWithRag = async (fullConversation: any, queryInput: string) => {
    return new Promise(async (resolve, reject) => {
      try {
        setLoading(true);

        // Update the chat with the user's userQuery first
        setConversation(fullConversation);

        // ---------------------------------------------- Generate RAG RESPONSE ---------------------------------------------- //
        const isGlobalRag =
          documentQueryMethod === DocumentQueryOptions.globalSearchValue &&
          enableRag;
        const ragResponse = await getRagResponse(
          (await auth?.currentUser?.getIdToken()) ?? "",
          queryInput,
          isGlobalRag ? "" : namespace,
          isGlobalRag ? PineconeIndexes.dynamicDocuments : indexName
        );

        if (!ragResponse.success) {
          fullConversation[fullConversation.length - 1].content =
            "Failed to generate RAG response";
        } else {
          // Add the new conversation to the list
          fullConversation[fullConversation.length - 1].content =
            ragResponse.data?.llmText;
        }

        setConversation([...fullConversation]);
        setRelevantDocs(ragResponse.data?.relevantDocs)
        setPdfLoading(false)
        setLoading(false);
        resolve("Success");
      } catch (error: unknown) {
        reject(error);
      }
    });
  };

  return { fetchWithRag };
}
