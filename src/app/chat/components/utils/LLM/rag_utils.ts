import { useRag } from "@/app/chat/api/rag";
import { useChatContext } from "../../store/ChatContext";
import { upsertConversation } from "../firebase/upsertConversation";
import { fetchGlobalDocuments, pdfSearch } from "../pdfs/pdf_utils";

/**
 * Makes a query with OpenAi's LLM and implements RAG using Pinecone vector store
 * @param query the query from the user
 */
export async function fetchWithRAG() {

  const {
    setDocumentQuery,
    setRelevantDocs,
    namespace,
    setAlert,
    setLoading,
    documentQueryMethod,
    setPdfLoading,
    setConversationTitles,
    conversationTitle,
    conversationUid,
    setConversationUid,
    setConversationTitle,
    globalSearch,
    setInfoAlert,
    indexName,
    includedDocuments,
    conversation,
    setConversation,
    userQuery,
    handleBeforeUnload
  } = useChatContext();

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

  if(globalSearch){
    await fetchGlobalDocuments(userQuery, namespace, setRelevantDocs, setPdfLoading, setInfoAlert)
  }

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
