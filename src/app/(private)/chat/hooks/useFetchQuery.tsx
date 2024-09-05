import { auth } from "@/lib/firebase/firebase";
import { DocumentQueryOptions, PineconeNamespaces } from "../enum/enums";
import { useChatContext } from "../store/ChatContext";
import useUpsertConversation from "../utils/firebase/upsertConversation";
import { useFetchLLMResponse } from "../utils/LLM/useFetchLLMResponse";
import { errorResponse } from "@/utils/utils";

const useFetchQuery = () => {
  const { fetchLLMResponse } = useFetchLLMResponse();
  const { upsertConversation } = useUpsertConversation();
  const {
    setAlert,
    setShowStartupImage,
    setPdfLoading,
    setLoading,
    setUserQuery,
    setConversation,
    conversation,
    setInfoAlert,
    handleBeforeUnload,
    includedDocuments
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

    // Prompts the user from leaving the page before the conversation is complete
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

      // Displays the user's query first
      setConversation(fullConversation);

      // Calls LLM to generate response to query
      await fetchLLMResponse(fullConversation, queryInput, includedDocuments);

      // Save or update the conversation after calling
      upsertConversation(fullConversation);
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
