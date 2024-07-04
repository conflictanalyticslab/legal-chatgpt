"use client";

import { Chat } from "@/app/chat/components/Chat";
import { WithSearch } from "@elastic/react-search-ui";
import {ChatContextProvider} from "@/app/chat/components/store/ChatContext"
import SearchProviderShell from "@/app/chat/components/SearchProviderShell";

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
            <Chat />
          </ChatContextProvider>
        )}
      </WithSearch>
    </SearchProviderShell>
  );
}