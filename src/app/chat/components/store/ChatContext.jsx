import { createContext, useContext, useRef, useState } from 'react';

// Create a context
const ChatContext = createContext();

export const ChatContextProvider = ({ children }) => {
  const [state, setState] = useState("default value");
  const [relevantDocs, setRelevantDocs] = useState([]);
  const [documentQuery, setDocumentQuery] = useState("");
  const [enableRag, setEnableRag] = useState(false);
  const [globalSearch, setGlobalSearch] = useState(false);
  const [ragConversation, setRagConversation] = useState([]);
  const [namespace, setNamespace] = useState("");
  const [userQuery, setUserQuery] = useState("");
  const [generateFlag, setGenerateFlag] = useState(true);
  const [loadingPDF, setLoadingPDF] = useState(false);
  const [documentQueryMethod, setDocumentQueryMethod] = useState("elastic");
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const generateFlagRef = useRef(generateFlag);
  const [conversationTitles, setConversationTitles] = useState([]);
  const [conversationTitle, setConversationTitle] = useState("");
  const [conversationUid, setConversationUid] = useState("");
  const [alert, setAlert] = useState("");
  const [infoAlert, setInfoAlert] = useState("");
  const [indexName, setIndexName] = useState("legal-pdf-documents");
  const [documents, setDocuments] = useState([]);
  const [showStartupImage, setShowStartupImage] = useState(true);
  const [includedDocuments, setIncludedDocuments] = useState([]);
  const [conversation, setConversation] = useState([]);
  const [latestResponse, setLatestResponse] = useState("");
  const [documentContent, setDocumentContent] = useState("");
  const [num, setNum] = useState(-1);

  // handle delete documents from UploadedDocuments
  const deleteDocumentChat = (uid) => {
    deleteDocument(uid)
      .then(() => setDocuments(documents.filter((doc) => doc.uid !== uid)))
      .catch((err) => {
        console.log("Error when deleting PDF, " + err);
      });
  };

  /**
   * Confirms with the user if they want to exit the tab
   *
   * @param event the close tab event
   */
  const handleBeforeUnload = (event) => {
    event.preventDefault();
    event.returnValue =
      "Are you sure you want to leave? The response will not be stored to your current chat's history if you exit right now.";
  };

  // Sets the appropriate local storage settings when toggling between elastic and keyword search
  const handleChangeDocumentQueryMethod = (queryMethod) => {
    if (queryMethod === "keyword-search") {
      setEnableRag(false);
      setGlobalSearch(false);
      localStorage.setItem("enableRag", JSON.stringify(false));
      localStorage.setItem("globalSearch", JSON.stringify(false));
    }

    setDocumentQueryMethod(queryMethod);
    localStorage.setItem(
      "documentQueryPrevChoice",
      JSON.stringify(queryMethod)
    );
  };

  return (
    <ChatContext.Provider
      value={{
        state,
        setState,
        relevantDocs,
        setRelevantDocs,
        documentQuery,
        setDocumentQuery,
        enableRag,
        setEnableRag,
        ragConversation,
        setRagConversation,
        namespace,
        setNamespace,
        userQuery,
        setUserQuery,
        generateFlag,
        setGenerateFlag,
        generateFlagRef,
        loadingPDF,
        setLoadingPDF,
        documentQueryMethod,
        setDocumentQueryMethod,
        alert,
        setAlert,
        loading,
        setLoading,
        pdfLoading,
        setPdfLoading,
        conversationTitles,
        setConversationTitles,
        conversationTitle,
        setConversationTitle,
        conversationUid,
        setConversationUid,
        globalSearch,
        setGlobalSearch,
        infoAlert,
        setInfoAlert,
        indexName,
        setIndexName,
        documents,
        setDocuments,
        showStartupImage,
        setShowStartupImage,
        includedDocuments,
        setIncludedDocuments,
        conversation,
        setConversation,
        latestResponse,
        setLatestResponse,
        userQuery,
        setUserQuery,
        documentContent,
        setDocumentContent,
        num,
        setNum,
        deleteDocumentChat,
        handleBeforeUnload,
        handleChangeDocumentQueryMethod
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => useContext(ChatContext);
