import { createWithEqualityFn as create } from "zustand/traditional";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { temporal } from "zundo";
import isDeepEqual from "fast-deep-equal";
import pick from "just-pick";
import throttle from "just-throttle";

import { Criteria} from "./nodes";
import { ulid } from "ulid";
import React, { useEffect } from "react";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePdfSearch } from "../../hooks/use-pdf-search";
import { useGlobalContext } from "@/app/store/global-context";
import { PineconeNamespaces } from "@/app/(private)/chat/enum/enums";
// type Fact

export enum PrecedentTypes {
    STATUTE = "statute",
    REGULATION = "regulation",
    SUPREME_COURT = "supreme_court",
    COURT_OF_APPEAL = "court_of_appeal",
    LOWER_COURT = "lower_court",
    UNKNOWN = "unspecified",
};
type Fact = {
    criteria: Criteria,
    value: string | Array<string>
}

const initialFacts: Fact[] = [
            {
              value: "",
              
              criteria: {
                id: ulid(),
                label: "",
                description: "",
                type: PrecedentTypes.UNKNOWN,
                citation: "",
              },

            }
];

interface CompiledFactSummary {
  name: string;
  prompt: Array<string>;
  isCustom?: boolean;
}

interface FactStore {
  graphId: string | null;
  conversationId: string | null;
  facts: Fact[];
  lastSaved: number | null;
  setGraphId: (graphId: string | null) => void;
  setConversationId: (conversationId: string | null) => void;
  setFacts: (facts: Fact[]) => void;
  addFact: (fact: Fact) => void;
  updateFact: (
    nodeId: string,
    mutateFn: (node: Fact) => Fact
  ) => void;
  removeFact: (nodeId: string) => void;
  setLastSaved: (lastSaved: number | null) => void;
  isOutdated: boolean;
  setIsOutdated(isOutdated: boolean): void;

  compiledFactSummary: CompiledFactSummary | null;
  setCompiledFactSummary: (
    compiledFactSummary: CompiledFactSummary | null
  ) => void;
}

/**
 * Store for the dialog flow graph
 *
 * This is only used by the dialog flow editor and not the conversation query.
 *
 * @see {@link useGlobalDialogFlowStore} for the compiled dialog flow to be used in the conversation query.
 */
export const useFactStore = create<FactStore>()(
  temporal(
    (set, get) => ({
      graphId: null,
      conversationId: null,
      facts: initialFacts,
      lastSaved: null,
      setGraphId: (graphId) => {
        set({ graphId });
      },
      setConversationId: (conversationId) => {
        set({ conversationId });
      },
      setFacts: (facts) => {
        set({
          facts: facts,
        });
      },
      addFact: (fact) => {
        set({
          facts: [...get().facts, fact],
        });
      },
      updateFact: (factId, mutateFn) => {
        const updatedNodes = get().facts.map((n) =>
          n.criteria.id === factId ? mutateFn(n) : n
        );
        set({ facts: updatedNodes });
      },
      removeFact: (factId) => {
        const { facts } = get();
        set({
          facts: facts.filter((fact) => fact.criteria.id !== factId),
        });
      },
      
      setLastSaved: (lastSaved) => {
        set({ lastSaved });
      },
      
    isOutdated: false,
    setIsOutdated: (isOutdated) => {
      set({ isOutdated });
    },

    compiledFactSummary: null,
    setCompiledFactSummary: (compiledFactSummary) => {
      set({ isOutdated: false, compiledFactSummary });
    },
    }),
    {
      // only track nodes and edges
      // https://github.com/charkour/zundo#exclude-fields-from-being-tracked-in-history
      partialize(state) {
        return {
          facts: state.facts
        };
      },
      // prevent unchanged states from getting stored in history
      // https://github.com/charkour/zundo#prevent-unchanged-states-from-getting-stored-in-history
      equality(pastState, currentState) {
        if (
          pastState.facts.length !== currentState.facts.length
        ) {
          return false;
        }

        for (let i = 0; i < currentState.facts.length; i++) {
          const a = pick(pastState.facts[i], ["criteria", "value"]);
          const b = pick(currentState.facts[i], ["criteria", "value"]);
          return isDeepEqual(a, b);
        }

        return isDeepEqual(pastState.facts, currentState.facts)

      },
      // TODO: https://github.com/charkour/zundo#store-state-delta-rather-than-full-object
      // throttle change
      // https://github.com/charkour/zundo#cool-off-period
      handleSet(handleSet) {
        return throttle((state) => handleSet(state), 500);
      },
    }
  )
);

function compileFacts(facts: Array<Fact>) {


  return facts.join("\n");
};


export function SearchResults() {  
  const { relevantDocs, documentQuery, namespace, pdfLoading } =
    useGlobalContext();
  const { pdfSearch } = usePdfSearch();

  const {facts} = useFactStore();

  const q = compileFacts(facts);
  console.log(q)
  const handleSearchDocuments = async () => {
    if (pdfLoading) return;
    pdfSearch(q, namespace);
  };
  return (
    <Accordion
      type="single"
      collapsible
      defaultValue="1"
      className=""
    >
      <AccordionItem value={"1"} className="border-b-0 overflow-hidden">
        <AccordionTrigger>
          <Label className="font-bold">Search Documents</Label>
        </AccordionTrigger>
        <AccordionContent className="overflow-hidden flex flex-col gap-3">
          {/* Document List Container */}
          <div
            className={cn(
              `flex flex-col gap-3 w-full bg-transparent relative h-full overflow-auto pb-[50px]`
            )}
          >
            {/* List of Documents */}
            {pdfLoading && namespace !== PineconeNamespaces.no_dataset ? (
              // Loading animation for relevant documents
              <Label className="text-[grey] flex items-center gap-3 justify-center h-full flex-col text-nowrap">
                Finding Relevant Documents
                <LoadingSpinner />
              </Label>
            ) : relevantDocs && relevantDocs.length > 0 ? (
              relevantDocs.map((doc: any, i: number) => (
                <Card key={i} className="bg-[#f8f8f8]">
                  <a href={doc.url} target="_blank" className="cursor-pointer">
                    <CardHeader className="pt-4 pb-2 px-6">
                      <CardTitle className="font-bold text-base truncate">
                        {doc.fileName}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-2">
                      <div className="flex flex-col">
                        <Label className="font-normal">URL:</Label>
                        <output className="text-[#0000EE] truncate text-xs">
                          {doc.url}
                        </output>
                      </div>
                      <div className="flex flex-col">
                        <Label className="font-normal">Abstract</Label>
                        <output className="max-h-[200px] text-ellipsis line-clamp-6 text-xs">
                          {doc.content}
                        </output>
                      </div>
                    </CardContent>
                  </a>
                </Card>
              ))
            ) : (
              // No documents available
              <Label className="text-[grey] absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] text-nowrap">
                No Documents Available.
              </Label>
            )}
          </div>
          
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
