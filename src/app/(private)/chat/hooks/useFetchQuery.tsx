import { auth } from "@/firebase";
import { DocumentQueryOptions } from "../enum/document-query.enum";
import { useChatContext } from "../store/ChatContext";
import useUpsertConversation from "../utils/firebase/upsertConversation";
import { useFetchWithLLM } from "../utils/LLM/normal_LLM_utils";
import { useFetchWithRag } from "../utils/LLM/rag_utils";
import { pdfSearch } from "../utils/pdfs/pdf_utils";

const useFetchQuery = () => {
  const { fetchWithRag } = useFetchWithRag();
  const { fetchWithLLM } = useFetchWithLLM();
  const { upsertConversation } = useUpsertConversation();
  const {
    setAlert,
    setShowStartupImage,
    setPdfLoading,
    setLoading,
    setUserQuery,
    enableRag,
    documentQueryMethod,
    setConversation,
    conversation,
    setInfoAlert,
    namespace,
    setRelevantDocs,
    handleBeforeUnload,
  } = useChatContext();
  
  const fetchQuery = async (queryInput:string) => {
    if (queryInput === "") return;

    // Check for authentication
    if (!auth.currentUser) {
      setAlert("Missing auth.currentUser");
      return;
    }

    setShowStartupImage(false);
    setLoading(true);
    setPdfLoading(true);
    setUserQuery("");
    window.addEventListener("beforeunload", handleBeforeUnload);

    try {
      // New full conversation the LLM will add to
      const fullConversation = conversation.concat([
        {
          role: "user",
          content: queryInput,
        },
        {
          role: "assistant",
          content: "",
        },
      ]);

      const llmMethod = enableRag ? fetchWithRag : fetchWithLLM;

      if (
        documentQueryMethod === DocumentQueryOptions.globalSearchValue &&
        enableRag
      ) {
        setConversation(fullConversation);
        
        await pdfSearch(
          documentQueryMethod,
          queryInput, 
          namespace,
          setRelevantDocs,
          setPdfLoading,
          setInfoAlert
        );

        // Calling Fetch Rag
        await fetchWithRag(fullConversation, queryInput);
      } else {
        await Promise.all([
          llmMethod(fullConversation, queryInput),
          pdfSearch(
            documentQueryMethod,
            queryInput,
            namespace,
            setRelevantDocs,
            setPdfLoading,
            setInfoAlert
          ),
        ]);
      }

      // Always save the conversation after we generate the LLM response
      upsertConversation(fullConversation);
    } catch (error: any) {
      if (typeof error === "string") setInfoAlert(error);
      else setInfoAlert(error.message);
      setLoading(false);
      setPdfLoading(false);
    }
  };

  return {
    fetchQuery,
  };
};

export default useFetchQuery;
