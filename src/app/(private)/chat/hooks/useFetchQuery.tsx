import { auth } from "@/lib/firebase/firebase";
import { DocumentQueryOptions } from "../enum/enums";
import { useChatContext } from "../store/ChatContext";
import useUpsertConversation from "../utils/firebase/upsertConversation";
import { useFetchWithLLM } from "../utils/LLM/normal_LLM_utils";
import { useFetchWithRag } from "../utils/LLM/fetchRAG";
import { pdfSearch } from "../utils/pdfs/pdf_utils";
import { errorResponse } from "@/utils/utils";

const useFetchQuery = () => {
  const { fetchWithRag } = useFetchWithRag();
  const { upsertConversation } = useUpsertConversation();
  const {
    setAlert,
    setShowStartupImage,
    setPdfLoading,
    setLoading,
    setUserQuery,
    documentQueryMethod,
    setConversation,
    conversation,
    setInfoAlert,
    namespace,
    setRelevantDocs,
    handleBeforeUnload,
  } = useChatContext();

  const fetchQuery = async (queryInput: string) => {
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

      // const llmMethod = enableRag ? fetchWithRag : fetchWithLLM;

      if (documentQueryMethod === DocumentQueryOptions.globalSearchValue) {
        setConversation(fullConversation);

        // 1. Perform PDF Search to populate Pincone DB
        await pdfSearch(
          queryInput,
          namespace,
          setRelevantDocs,
          setPdfLoading,
          setInfoAlert
        );

        // 2. Call fetch with RAG
        await fetchWithRag(fullConversation, queryInput);
      }

      // Concurrently gets the pdf documents and saves the conversation
      fetchWithRag(fullConversation, queryInput).then(() => {
        // Always save the conversation after we generate the LLM response
        upsertConversation(fullConversation);
      }).catch((error:unknown)=>{
        setInfoAlert(errorResponse(error))
      });

      // await pdfSearch(
      //   queryInput,
      //   namespace,
      //   setRelevantDocs,
      //   setPdfLoading,
      //   setInfoAlert
      // );
    } catch (error: any) {
      setInfoAlert(errorResponse(error));
      setLoading(false);
      setPdfLoading(false);
    }
  };

  return {
    fetchQuery,
  };
};

export default useFetchQuery;
