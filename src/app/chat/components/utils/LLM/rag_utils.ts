import { elasticDtoToRelevantDocuments, pineconeDtoToRelevantDocuments } from "@/app/chat/api/documents/transform";
import { updateConversation } from "../firebase/firebase_utils";
import { postSearchTerms } from "@/util/requests/postSearchTerms";
import { pdfSearch } from "../pdfs/pdf_utils";

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
  setAlert: any,
  handleBeforeUnload: any,
  documentQueryMethod: any,
  setPdfLoading:any,
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

  // Chooses which method we are using to query for the pdf
  pdfSearch(
    documentQueryMethod,
    userQuery,
    namespace,
    setAlert,
    setRelevantDocs,
    setPdfLoading,
  );
  setDocumentQuery(userQuery);

  // Update Conversation Title
  updateConversation(
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
