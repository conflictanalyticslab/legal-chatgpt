import { useChatContext } from "../../store/ChatContext";
import { DocumentQueryOptions, PineconeIndexes } from "../../enum/enums";
import { getRagResponse } from "../../api/actions/getRagResponse";
import { auth } from "@/lib/firebase/firebase";
import { errorResponse } from "@/utils/utils";

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
    setPdfLoading,
    setInfoAlert,
  } = useChatContext();

  /**
   * Fetch documents using RAG
   * @param fullConversation
   * @param queryInput
   */
  const fetchWithRag = async (fullConversation: any, queryInput: string) => {
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
        setRelevantDocs(ragResponse.data?.relevantDocs);

        console.log("This is the ragResponse", ragResponse)
      }

      // setConversation([...fullConversation]);
    } catch (error: unknown) {
      setInfoAlert(errorResponse(error));
    } finally {
      setPdfLoading(false);
      setLoading(false);
    }
  };

  return { fetchWithRag };
}
