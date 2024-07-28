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
  const [namespace, setNamespace] = useState('');
  const [userQuery, setUserQuery] = useState('');
  const [generateFlag, setGenerateFlag] = useState(true);
  const [loadingPDF, setLoadingPDF] = useState(false);
  const [documentQueryMethod, setDocumentQueryMethod] = useState('elastic')
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const generateFlagRef = useRef(generateFlag);
  const [conversationTitles, setConversationTitles] = useState([]);
  const [conversationTitle, setConversationTitle] = useState('');
  const [conversationUid, setConversationUid] = useState('');
  const [alert, setAlert] = useState('');
  const [infoAlert, setInfoAlert] = useState('');

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
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => useContext(ChatContext);
