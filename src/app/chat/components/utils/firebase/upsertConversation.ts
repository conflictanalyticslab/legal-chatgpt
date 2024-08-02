import { postConversationSave } from "@/util/requests/postConversationSave";
import { postConversationTitle } from "@/util/requests/postConversationTitle";
import { putConversationSave } from "@/util/requests/putConversationSave";

/**
 * Upsert the conversation to firebase
 * Either insert a new conversation document
 * or update an existing new conversation document 
 * 
 * @param conversation 
 * @param includedDocuments 
 * @param setAlert 
 * @param setConversationTitle 
 * @param conversationUid 
 * @param setConversationUid 
 * @param handleBeforeUnload 
 * @returns 
 */
export async function upsertConversation(
  conversation: Object[],
  includedDocuments: any,
  setAlert: any,
  conversationTitle: string,
  setConversationTitle: any,
  setConversationTitles: any,
  conversationUid: any,
  setConversationUid: any,
  handleBeforeUnload: any
) {
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
        const convoRes = await postConversationSave(
          conversation,
          includedDocuments,
          title
        );

        const convo = await convoRes.json();

        setConversationUid(convo.uid);
        setConversationTitle(title); // Update selected conversation
        setConversationTitles((curConversationTitles: any) => {
          return [{ title, userUid: convo.uid }, ...curConversationTitles];
        });
      } catch (error) {
        console.log(error);
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
    console.log(error);
  }
}