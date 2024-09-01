import { useChatContext } from "../../store/ChatContext";
import { DocumentQueryOptions, PineconeIndexes } from "../../enum/enums";
import { getGraphResponse } from "../../api/actions/getGraphResponse";
import { auth } from "@/lib/firebase/firebase";
import { errorResponse } from "@/utils/utils";

/**
 * Custom hook to fetch data with RAG
 * @returns {Object} hook API
 */
export function useFetchWithGraph() {
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
  const fetchWithGraph = async (fullConversation: any, queryInput: string) => {
    try {
      setLoading(true);

      // Update the chat with the user's userQuery first
      setConversation(fullConversation);

      const graphResponse = await getGraphResponse(
        (await auth?.currentUser?.getIdToken()) ?? "",
        queryInput
      );

      if (!graphResponse.success) {
        fullConversation[fullConversation.length - 1].content =
          "Failed to generate RAG response";
      } else {
        // Add the new conversation to the list
        fullConversation[fullConversation.length - 1].content =
          graphResponse.data;
        // setRelevantDocs(graphResponse.data);

        console.log("This is the graphResponse", graphResponse)
      }

      // setConversation([...fullConversation]);
    } catch (error: unknown) {
      setInfoAlert(errorResponse(error));
    } finally {
      setPdfLoading(false);
      setLoading(false);
    }
  };

  return { fetchWithGraph };
}
