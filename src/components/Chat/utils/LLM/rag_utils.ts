import { elasticDtoToRelevantDocuments, pineconeDtoToRelevantDocuments } from "@/app/chat/api/documents/transform";
import { useChatContext } from "../../store/ChatContext";
import { updateConversationTitle } from "../firebase/firebase_utils";
import { postSearchTerms } from "@/util/requests/postSearchTerms";

/**
 * Makes a query with OpenAi's LLM and implements RAG using Pinecone vector store
 * @param query the query from the user
 */
export async function fetchWithRAG(
  userQuery: string,
  conversation: any,
  setConversation: any,
  useRag: any,
  namespace: string,
  includedDocuments: any,
  setConversationTitle: any,
  setConversationUid: any,
  conversationUid: any,
  setLoading: any,
  conversationTitle: any,
  setDocumentQuery: any,
  setRelevantDocs: any,
  similaritySearch: any,
  setAlert: any,
  handleBeforeUnload: any,
  documentQueryMethod: any
) {

  // Update the chat with the user's userQuery first
  const fullConversation = [
    ...conversation,
    {
      role: "user",
      content: userQuery,
    },
    {
      role: "assistant",
      content: "",
    },
  ];
  setConversation(fullConversation);

  // ---------------------------------------------- Generate RAG RESPONSE ---------------------------------------------- //
  const ragResponse = await useRag(userQuery, namespace);
  fullConversation[fullConversation.length - 1].content = ragResponse;
  setConversation([...fullConversation]);
  setLoading(false);

  // ---------------------------------------------- DOCUMENT SEARCH ---------------------------------------------- //

  // Elastic Search
  if (documentQueryMethod === "elastic") {
    // Generate elastic search prompt and document prompt from Open AI
    const search_terms_res = await postSearchTerms(userQuery);

    if (!search_terms_res.ok) {
      const errorData = await search_terms_res.json();
      setAlert(errorData.error);
      setLoading(false);
      return;
    }

    // Retrieve elastic search results and get selected pdf document(s) text
    const { elasticSearchResults } = await search_terms_res.json();
    setRelevantDocs(elasticDtoToRelevantDocuments(elasticSearchResults));
  } else {
    // SemanticSearch
    const similarDocs = await similaritySearch(userQuery, 3, namespace);
    setRelevantDocs(pineconeDtoToRelevantDocuments(similarDocs));
  }

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
