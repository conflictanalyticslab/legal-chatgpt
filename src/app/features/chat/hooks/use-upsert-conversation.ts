/**
 * @file: upsertConversation.ts - Upsert a new or existing conversation data to Firebase.
 *                                Note: We can't merge these functions into 1 api call since
 *                                      we have to generate a new title when saving new conversation
 *
 * @author Kevin Yu <yu.kevin2002@gmail.com>
 * @date Jul 2024
 */

import { useGlobalContext } from "../../../store/global-context";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase-admin/firebase";
import { conversationTitleSchema } from "@/app/features/chat/models/schema";
import { postConversationTitle } from "@/app/api/(api-service-layer)/post-conversation-title";
import { putConversationSave } from "@/app/api/(api-service-layer)/put-conversationSave";
import { postConversationSave } from "@/app/api/(api-service-layer)/post-conversationSave";

const useUpsertConversation = () => {
  const {
    includedDocuments,
    setAlert,
    conversationTitle,
    setConversationTitles,
    conversationId,
    setConversationId,
    handleBeforeUnload,
    conversationTitles,
    num,
    setNum,
    user,
  } = useGlobalContext();

  /**
   * Save the conversation in Firebase
   * @param conversation
   * @returns
   */
  const upsertConversation = async (conversation: any) => {
    try {
      // Generate new conversation title and add it to the database
      if (conversation.length <= 2) {
        // 1. GENERATE CONVERSATION TITLE
        const titleResPromise = await postConversationTitle(
          conversation,
          includedDocuments
        );

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
          const response = await postConversationSave(
            conversation,
            includedDocuments,
            title
          );

          const data = await response.json();

          // Validate the new title
          const validConversationTitle = conversationTitleSchema.parse(
            data.data
          );

          // Setting the active conversation title and id to the newly created one
          setConversationId(validConversationTitle.conversationId);
          setConversationTitles(
            [validConversationTitle].concat(conversationTitles)
          );
        } catch (error) {
          console.error("Error saving new conversation:", error);
        }

        window.removeEventListener("beforeunload", handleBeforeUnload);
      } else {
        // 1. UPDATE EXISTING CONVERSATION TO FIRESTORE
        await putConversationSave(
          conversationId, // Note the conversation Uid is really just the user_id in firestore
          conversation,
          includedDocuments,
          conversationTitle,
          conversationId
        );
      }

      // Decrement the prompt count
      // Todo: refactor this:
      setNum((prevNum: number) => prevNum - 1);

      const newUser = {
        ...user,
        prompts_left: num - 1,
      };
      const docRef = doc(db, "users", user.uid);
      await updateDoc(docRef, newUser);
    } catch (error) {
      console.error("Error upserting conversation:", error);
    }
  };

  return { upsertConversation };
};

export default useUpsertConversation;
