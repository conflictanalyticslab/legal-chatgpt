"use client";

/**
 * This file stores the includedDocuments string array in local storage so the state
 * is persisted between local sessions.
 */
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

export interface IncludedDocumentsContextType {
  includedDocuments: string[];
  setIncludedDocuments: React.Dispatch<React.SetStateAction<string[]>>;
}

const IncludedDocumentsContext = createContext<
  IncludedDocumentsContextType | undefined
>(undefined);

export function useIncludedDocuments(): IncludedDocumentsContextType {
  const context = useContext(IncludedDocumentsContext);
  if (context === undefined) {
    throw new Error(
      "useIncludedDocuments must be used within an IncludedDocumentsProvider"
    );
  }
  return context;
}

export function IncludedDocumentsProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [includedDocuments, setIncludedDocuments] = useState<string[]>([]);

  // Load the state from localStorage if available
  useEffect(() => {
    const savedIncludedDocuments = localStorage.getItem("includedDocuments");
    if (savedIncludedDocuments) {
      setIncludedDocuments(JSON.parse(savedIncludedDocuments));
    }
  }, []);

  // Save the state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(
      "includedDocuments",
      JSON.stringify(includedDocuments)
    );
  }, [includedDocuments]);

  return (
    <IncludedDocumentsContext.Provider
      value={{ includedDocuments, setIncludedDocuments }}
    >
      {children}
    </IncludedDocumentsContext.Provider>
  );
}
