"use client";

import { useState } from "react";

import { Chat } from "@/components/Chat/Chat";
import { FlowGraph } from "@/components/Chat/FlowGraph";
import { WithSearch } from "@elastic/react-search-ui";

import SearchProviderShell from "@/components/Chat/SearchProviderShell";

export default function Page() {

  const [useFlow, setUseFlow] = useState(false); 

  return (
    <SearchProviderShell>
      <WithSearch
        mapContextToProps={({ wasSearched, setSearchTerm }) => ({
          wasSearched,
          setSearchTerm,
        })}
      >
        { !useFlow ? ({ wasSearched, setSearchTerm}) => (
          <Chat wasSearched={wasSearched} setSearchTerm={setSearchTerm} setUseFlow={setUseFlow}/>
        ) : () => (
          <FlowGraph setUseFlow={setUseFlow} />
        )}
      </WithSearch>
    </SearchProviderShell>
  );
}