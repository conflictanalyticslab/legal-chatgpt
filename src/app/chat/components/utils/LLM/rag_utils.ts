import { upsertConversation } from "../firebase/upsertConversation";
import { fetchGlobalDocuments, pdfSearch } from "../pdfs/pdf_utils";

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
  conversationTitle: any,
  setConversationTitle: any,
  setConversationUid: any,
  conversationUid: any,
  setLoading: any,
  setDocumentQuery: any,
  setRelevantDocs: any,
  setAlert: any,
  handleBeforeUnload: any,
  documentQueryMethod: any,
  setPdfLoading:any,
  setConversationTitles: any,
  globalSearch: any,
  setInfoAlert: any,
  indexName: string,
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

  // ---------------------------------------------- GLOBAL SEARCH ---------------------------------------------- //

  if(globalSearch)
    await fetchGlobalDocuments(userQuery, namespace='', setRelevantDocs, setPdfLoading, setInfoAlert)

  // ---------------------------------------------- Generate RAG RESPONSE ---------------------------------------------- //
  const ragResponse = await useRag(userQuery, namespace, indexName);
  
  if(!ragResponse.ok){
    fullConversation[fullConversation.length - 1].content = "Failed to generate RAG response";
  } 
  else
  {
    // Add the new conversation to the list
    fullConversation[fullConversation.length - 1].content = ragResponse.data;
  }

  setConversation([...fullConversation]);
  setLoading(false);

  // ---------------------------------------------- DOCUMENT SEARCH ---------------------------------------------- //

  if(!globalSearch){
    // Chooses which method we are using to query for the pdf
    pdfSearch(
      documentQueryMethod,
      userQuery,
      namespace,
      setRelevantDocs,
      setPdfLoading,
      setInfoAlert
    );
  }

  setDocumentQuery(userQuery);

  // Update Conversation History
  upsertConversation(
    fullConversation,
    includedDocuments,
    setAlert,
    conversationTitle,
    setConversationTitle,
    setConversationTitles,
    conversationUid,
    setConversationUid,
    handleBeforeUnload,
  );
}
