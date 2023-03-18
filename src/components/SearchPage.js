import React from "react";
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
import "../App.css";
import axios from "axios";

const connector = new AppSearchAPIConnector({
    searchKey: process.env.REACT_APP_PUBLIC_SEARCH_KEY,
    engineName: "open-justice-meta",
    endpointBase: process.env.REACT_APP_ENDPOINT_URL,
});

const config = {
    alwaysSearchOnInitialLoad: false,
    apiConnector: connector,
    hasA11yNotifications: true,
    searchQuery: {
        result_fields: {
            title: {
                snippet: {
                    fallback: true,
                    size: 100,
                },
            },
            abstract: {
                snippet: {
                    fallback: true,
                    size: 500,
                },
            },
            body: {
                snippet: {
                    fallback: true,
                },
            },
            url: { raw: {} },
        },
        search_fields: { title: {} },
        disjunctiveFacets: [""],
        facets: {},
    },
};

const SearchPage = () => {
    const handleSearch = (searchTerm, setSearchTerm) => {
        // config reference: https://github.com/scholarsportal/text-mining/blob/main/corpus-builder.py
        const page = 1;
        const pageLength = 20;
        const dataType = "full";
        const url = `/search?q=((${searchTerm}))&page=${page}&page_length=${pageLength}&data=${dataType}&format=json`;

        axios
            .get(url)
            .then(async (res) => {
                const results = res["data"]["response"]["results"]["result"];
                console.log(results);

                const elasticUrl = process.env.REACT_APP_ELASTICSEARCH_URL;
                const config = {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${process.env.REACT_APP_PRIVATE_SEARCH_KEY}`,
                    },
                };
                axios.post(elasticUrl, results, config).then((res) => {
                    setTimeout(function () {
                        setSearchTerm(searchTerm);
                    }, 500);
                });
            })
            .catch((err) => {
                console.log(err);
                setSearchTerm(searchTerm);
            });
    };
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
                        <ErrorBoundary>
                            <Layout
                                header={
                                    <SearchBox
                                        debounceLength={0}
                                        onSubmit={(searchTerm) => {
                                            handleSearch(
                                                searchTerm,
                                                setSearchTerm
                                            );
                                        }}
                                    />
                                }
                                bodyContent={
                                    <Results
                                        titleField="title"
                                        urlField="url"
                                        shouldTrackClickThrough={true}
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
                    );
                }}
            </WithSearch>
        </SearchProvider>
    );
};

export default SearchPage;
