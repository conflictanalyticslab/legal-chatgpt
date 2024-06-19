import { updateConversationTitle } from "./firebase_utils";

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
  setPdfQuery: any,
  setRelevantPDFs: any,
  similaritySearch: any,
  setAlert:any,
  handleBeforeUnload:any,
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

  // ---------------------------------------------- SEMANTIC SEARCH ---------------------------------------------- //
  setPdfQuery(userQuery);
  const pdfs = await similaritySearch(userQuery, 3, namespace);
  setRelevantPDFs(pdfs.matches);

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
