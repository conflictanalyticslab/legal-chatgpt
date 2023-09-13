"use client";

import { Chat } from "@/components/Chat/Chat";
import { WithSearch } from "@elastic/react-search-ui";

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
          <Chat wasSearched={wasSearched} setSearchTerm={setSearchTerm} />
        )}
      </WithSearch>
    </SearchProviderShell>
  );
}
