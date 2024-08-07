import { createContext, useContext, useState } from 'react';

// Create a context
const ChatContext = createContext();

export const ChatContextProvider = ({ children }) => {
  const [state, setState] = useState("default value");
  const [relevantPDFs, setRelevantPDFs] = useState([]);
  const [LLMQuery, setLLMQuery] = useState('')
  const [enableRag, setEnableRag] = useState(false);
  const [ragConversation, setRagConversation] = useState([])
  return (
    <ChatContext.Provider
      value={{ state, setState, relevantPDFs, setRelevantPDFs, LLMQuery, setLLMQuery, enableRag, setEnableRag, ragConversation, setRagConversation }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => useContext(ChatContext);
