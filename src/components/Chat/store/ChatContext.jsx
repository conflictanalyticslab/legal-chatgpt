import { createContext, useContext, useState } from 'react';

// Create a context
const ChatContext = createContext();

export const ChatContextProvider = ({ children }) => {
  const [state, setState] = useState("default value");
  const [relevantPDFs, setRelevantPDFs] = useState([]);
  const [LLMQuery, setLLMQuery] = useState('')
  return (
    <ChatContext.Provider
      value={{ state, setState, relevantPDFs, setRelevantPDFs, LLMQuery, setLLMQuery }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => useContext(ChatContext);
