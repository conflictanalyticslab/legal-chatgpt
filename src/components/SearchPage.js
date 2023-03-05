import React from "react";
import "../App.css";
import AppSearchAPIConnector from "@elastic/search-ui-app-search-connector";
import {
    ErrorBoundary,
    Facet,
    SearchProvider,
    SearchBox,
    Results,
    PagingInfo,
    ResultsPerPage,
    Paging,
    WithSearch,
} from "@elastic/react-search-ui";
import {
    BooleanFacet,
    Layout,
    SingleLinksFacet,
    SingleSelectFacet,
} from "@elastic/react-search-ui-views";
import "@elastic/react-search-ui-views/lib/styles/styles.css";
import { SearchDriverOptions } from "@elastic/search-ui";

const connector = new AppSearchAPIConnector({
    searchKey: process.env.REACT_APP_PUBLIC_SEARCH_KEY,
    engineName: "open-justice-meta",
    endpointBase: process.env.REACT_APP_ENDPOINT_URL,
});

const config = {
    alwaysSearchOnInitialLoad: true,
    apiConnector: connector,
    hasA11yNotifications: true,
    searchQuery: {
        result_fields: {
            title: {
                snippet: {
                    fallback: true,
                },
            },
            body: {
                snippet: {
                    fallback: true,
                },
            },
        },
        search_fields: { title: {} },
        disjunctiveFacets: [""],
        facets: {},
    },
};

const SearchPage = () => {
    return (
        <SearchProvider config={config}>
            <WithSearch
                mapContextToProps={({ wasSearched, setSearchTerm }) => ({
                    wasSearched,
                    setSearchTerm,
                })}
            >
                {({ wasSearched, setSearchTerm }) => {
                    return (
                        <div className="App">
                            <ErrorBoundary>
                                <Layout
                                    header={
                                        <SearchBox
                                            debounceLength={0}
                                            onSubmit={(searchTerm) => {
                                                setTimeout(function () {
                                                    console.log("hi");
                                                    setSearchTerm(searchTerm);
                                                }, 5000);
                                            }}
                                        />
                                    }
                                    sideContent={<div></div>}
                                    bodyContent={
                                        <Results
                                            titleField="title"
                                            urlField="url"
                                            shouldTrackClickThrough
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
                        </div>
                    );
                }}
            </WithSearch>
        </SearchProvider>
    );
};

export default SearchPage;
