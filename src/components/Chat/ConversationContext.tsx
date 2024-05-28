import { createContext } from 'react';

type ConversationContextType = {
    conversationTitles: string[];
    setConversationTitle: (title: string) => void;
  };

  const initialConversationContext: ConversationContextType = {
    conversationTitles: ["OpenJustice"],
    setConversationTitle: () => {},
  };
  
  const ConversationContext = createContext(initialConversationContext);

export default ConversationContext;