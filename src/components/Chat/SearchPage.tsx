"use client";

import React from "react";
import {
  ErrorBoundary,
  Facet,
  SearchBox,
  Results,
  PagingInfo,
  ResultsPerPage,
  Paging,
} from "@elastic/react-search-ui";
import { Layout, SingleLinksFacet } from "@elastic/react-search-ui-views";
import "@elastic/react-search-ui-views/lib/styles/styles.css";
import { postSearch } from "@/util/requests/postSearch";

const SearchPage = ({
  wasSearched,
  setSearchTerm,
}: {
  wasSearched: boolean;
  setSearchTerm: (searchTerm: string) => void;
}) => {

  const handleSearch = async (searchTerm: string) => {
    
    const searchResults = await postSearch(searchTerm);
    const results = await searchResults.json();
    console.log(results);
    const elasticUrl = process.env.NEXT_PUBLIC_ELASTICSEARCH_URL || "";
    const elasticResults = await fetch(elasticUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_PRIVATE_SEARCH_KEY}`,
      },
      body: JSON.stringify(results), // Assuming 'results' is the data you want to send
    });
    
    setSearchTerm(searchTerm);

  }
  return (
    <ErrorBoundary>
      <Layout
        header={
          <SearchBox
            debounceLength={0}
            onSubmit={(searchTerm) => {
              // TO DO: Display the results.
              handleSearch(searchTerm, setSearchTerm)
            }}
          />
        }
        sideContent={
          <div>
            <Facet field="source" label="Source" view={SingleLinksFacet} />
          </div>
        }
        bodyContent={
          <Results
            titleField="title"
            urlField="url"
            shouldTrackClickThrough={true}
            clickThroughTags={["user1"]}
          />
        }
        bodyHeader={
          <>
            {wasSearched && <PagingInfo />}
            {wasSearched && <ResultsPerPage />}
          </>
        }
        bodyFooter={<Paging />}
      />
    </ErrorBoundary>
    // <ErrorBoundary>
    //     <SearchBox
    //         debounceLength={0}
    //         onSubmit={(searchTerm) => {
    //             handleSearch(searchTerm, setSearchTerm);
    //         }}
    //     />
    //     {/* // sideContent={
    //         //     <div>
    //         //         <Facet
    //         //             field="source"
    //         //             label="Source"
    //         //             view={SingleLinksFacet}
    //         //         />
    //         //     </div>
    //         // }
    //         // bodyContent={
    //         //     <Results
    //         //         titleField="title"
    //         //         urlField="url"
    //         //         shouldTrackClickThrough={true}
    //         //         clickThroughTags={["user1"]}
    //         //     />
    //         // }
    //         // bodyHeader={
    //         //     <>
    //         //         {wasSearched && <PagingInfo />}
    //         //         {wasSearched && <ResultsPerPage />}
    //         //     </>
    //         // }
    //         // bodyFooter={<Paging />} */}
    // </ErrorBoundary>
  );
};

export default SearchPage;
