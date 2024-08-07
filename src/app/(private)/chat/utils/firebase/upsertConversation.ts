import { postConversationSave } from "@/util/requests/postConversationSave";
import { postConversationTitle } from "@/util/requests/postConversationTitle";
import { putConversationSave } from "@/util/requests/putConversationSave";
import { useChatContext } from "../../store/ChatContext";

const useUpsertConversation = () => {
  const {
    includedDocuments,
    setAlert,
    conversationTitle,
    setConversationTitle,
    setConversationTitles,
    conversationUid,
    setConversationUid,
    handleBeforeUnload,
  } = useChatContext();

  const upsertConversation = async (conversation:any) => {
    try {

      // Generate new conversation title and add it to the database
      if (conversation.length <= 2) {
        // 1. GENERATE CONVERSATION TITLE
        const titleResPromise = await postConversationTitle(conversation, includedDocuments);

        // Check if the generated title response works
        if (!titleResPromise.ok) {
          const errorData = await titleResPromise.json();
          setAlert(errorData.error);
          return;
        }

        // Generated title
        const { title } = await titleResPromise.json();

        try {
          // 2. INSERT NEW CONVERSATION TO FIRESTORE
          const convoRes = await postConversationSave(conversation, includedDocuments, title);
          const convo = await convoRes.json();

          // Setting the active conversation title and id to the newly created one
          setConversationUid(convo.uid);
          setConversationTitle(title); // Update selected conversation
          setConversationTitles((curConversationTitles:any) => {
            return [{ title, userUid: convo.uid }, ...curConversationTitles];
          });
        } catch (error) {
          console.error("Error saving new conversation:", error);
        }

        window.removeEventListener("beforeunload", handleBeforeUnload);
      }

      if (!conversationUid) return;

      // 1. UPDATE EXISTING CONVERSATION TO FIRESTORE
      await putConversationSave(
        conversationUid, // Note the conversation Uid is really just the user_id in firestore
        conversation,
        includedDocuments,
        conversationTitle
      );
    } catch (error) {
      console.error("Error upserting conversation:", error);
    }
  };

  return { upsertConversation };
};

export default useUpsertConversation;
