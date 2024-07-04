import { postConversationSave } from "@/util/requests/postConversationSave";
import { postConversationTitle } from "@/util/requests/postConversationTitle";
import { putConversationSave } from "@/util/requests/putConversationSave";

export async function updateConversation(
  conversation: Object[],
  includedDocuments: any,
  setAlert: any,
  conversationTitle: string,
  setConversationTitle: any,
  conversationUid: any,
  setConversationUid: any,
  handleBeforeUnload: any
) {
  console.log("conversation lengthlksdjfalk", conversation)
  if (conversation.length <= 2) {
    //Generates relevant conversation title
    const titleResPromise = await postConversationTitle(
      conversation,
      includedDocuments
    );

    if (!titleResPromise.ok) {
      const errorData = await titleResPromise.json();
      setAlert(errorData.error);
      return;
    }
    
    const { title } = await titleResPromise.json();
    window.removeEventListener("beforeunload", handleBeforeUnload);

    // save new conversation to db
    (await postConversationSave(conversation, includedDocuments, title))
      .json()
      .then((res) => {
        console.log("heres the result", res)
        setConversationUid(res.uid);
      })
      .catch((err) => {
        console.log(err);
      });
  } else if (conversationUid) {

    // Save existing conversation to db
    await putConversationSave(
      conversationUid,
      conversation,
      includedDocuments,
      conversationTitle
    );
  }
}