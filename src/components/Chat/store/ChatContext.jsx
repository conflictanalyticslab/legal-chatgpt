import { createContext, useContext, useRef, useState } from 'react';

// Create a context
const ChatContext = createContext();

export const ChatContextProvider = ({ children }) => {
  const [state, setState] = useState("default value");
  const [relevantPDFs, setRelevantPDFs] = useState([]);
  const [pdfQuery, setPdfQuery] = useState('')
  const [enableRag, setEnableRag] = useState(false);
  const [ragConversation, setRagConversation] = useState([]);
  const [namespace, setNamespace] = useState('');
  const [userQuery, setUserQuery] = useState('');
  const [generateFlag, setGenerateFlag] = useState(true);
  const generateFlagRef = useRef(generateFlag);

  return (
    <ChatContext.Provider
      value={{ state, setState, relevantPDFs, setRelevantPDFs, pdfQuery, setPdfQuery, enableRag, setEnableRag, ragConversation, setRagConversation, namespace, setNamespace, userQuery, setUserQuery, generateFlag, setGenerateFlag, generateFlagRef }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => useContext(ChatContext);
