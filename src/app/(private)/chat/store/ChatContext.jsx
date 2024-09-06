"use client";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { ChatAction, PineconeIndexes, PineconeNamespaces } from "../enum/enums";

// Create a context
const ChatContext = createContext();

export const ChatContextProvider = ({ children }) => {
  const [state, setState] = useState("default value");
  const [relevantDocs, setRelevantDocs] = useState([]);
  const [documentQuery, setDocumentQuery] = useState("");
  const [ragConversation, setRagConversation] = useState([]);
  const [namespace, setNamespace] = useState(PineconeNamespaces.canadian_law);
  const [userQuery, setUserQuery] = useState("");
  const [generateFlag, setGenerateFlag] = useState(true);
  const [loadingPDF, setLoadingPDF] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const generateFlagRef = useRef(generateFlag);
  const [conversationTitles, setConversationTitles] = useState([]);
  const [conversationId, setConversationId] = useState("");
  const [alert, setAlert] = useState("");
  const [infoAlert, setInfoAlert] = useState("");
  const [indexName, setIndexName] = useState(PineconeIndexes.staticDocuments);
  const [documents, setDocuments] = useState([]);
  const [showStartupImage, setShowStartupImage] = useState(true);
  const [includedDocuments, setIncludedDocuments] = useState([]);
  const [dialogFlow, setDialogFlow] = useState("");
  const [conversation, setConversation] = useState([]);
  const [latestResponse, setLatestResponse] = useState("");
  const [documentContent, setDocumentContent] = useState("");
  const [num, setNum] = useState(-1);
  const [chatAction, setChatAction] = useState(ChatAction.searchDocuments);
  const [user, setUser] = useState(null);

  const scrollIntoViewRef = useRef(null);

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
  const restoreUserPreferences = () => {
    const namespacePref = localStorage.getItem("namespace");
    if (!namespacePref) return;
    setNamespace(JSON.parse(namespacePref));
  };

  /**
   * Stops generating the normal LLM buffered output
   *
   * @param event
   * @returns
   */
  const stopQuery = (event) => {
    event.preventDefault();
    generateFlagRef.current = false;
    setLoading(false);
    setPdfLoading(false);
  };

  useEffect(() => {
    restoreUserPreferences();
  }, []);

  return (
    <ChatContext.Provider
      value={{
        state,
        setState,
        relevantDocs,
        setRelevantDocs,
        documentQuery,
        setDocumentQuery,
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
        alert,
        setAlert,
        loading,
        setLoading,
        pdfLoading,
        setPdfLoading,
        conversationTitles,
        setConversationTitles,
        conversationId,
        setConversationId,
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
        stopQuery,
        scrollIntoViewRef,
        chatAction,
        setChatAction,
        setUser,
        user,
        dialogFlow,
        setDialogFlow
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => useContext(ChatContext);
