"use client";

import { Chat } from "@/components/Chat/Chat";
import { WithSearch } from "@elastic/react-search-ui";
import {ChatContextProvider} from "@/components/Chat/store/ChatContext"
import SearchProviderShell from "@/components/Chat/SearchProviderShell";

export default function Page() {
  return (
    <SearchProviderShell>
      <WithSearch
        mapContextToProps={({ wasSearched, setSearchTerm }) => ({
          wasSearched,
          setSearchTerm,
        })}
      >
        {({ wasSearched, setSearchTerm }) => (
          <ChatContextProvider>
            <Chat wasSearched={wasSearched} setSearchTerm={setSearchTerm} />
          </ChatContextProvider>
        )}
      </WithSearch>
    </SearchProviderShell>
  );
}