import { useChatContext } from "../../store/ChatContext";
import { DocumentQueryOptions, PineconeIndexes } from "../../enum/enums";
import { getRagResponse } from "../../api/actions/getRagResponse";
import { auth } from "@/firebase";
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
  } = useChatContext();

  /**
   * Fetch documents using RAG
   * @param fullConversation
   * @param queryInput
   */
  const fetchWithRag = async (fullConversation: any, queryInput: string) => {
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

    if (!ragResponse.ok) {
      fullConversation[fullConversation.length - 1].content =
        "Failed to generate RAG response";
    } else {
      // Add the new conversation to the list
      fullConversation[fullConversation.length - 1].content = ragResponse.data;
    }

    setConversation([...fullConversation]);
    setLoading(false);
  };

  return { fetchWithRag };
}
