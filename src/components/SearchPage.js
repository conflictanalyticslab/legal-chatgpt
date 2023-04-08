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
        filters: [],
        result_fields: {
            title: {
                snippet: {
                    fallback: true,
                    size: 100,
                },
            },
            type: { raw: {} },
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
        disjunctiveFacets: ["type"],
        facets: { type: { type: "value", size: 30 } },
    },
};

const SearchPage = () => {
    const handleSearch = (searchTerm, setSearchTerm) => {
        // Scholars Portal
        // reference: https://github.com/scholarsportal/text-mining/blob/main/corpus-builder.py
        const page = 1;
        const pageLength = 20;
        const dataType = "full";
        const urlScholarsPortal = `/scholarsportal/search?q=((${searchTerm}))&page=${page}&page_length=${pageLength}&data=${dataType}&format=json`;

        // SerpAPI (Google Search)
        // reference: https://serpapi.com/search-api
        const urlSerpAPI = `/serpapi/search?engine=google&q="${searchTerm} site:www.canlii.org"&api_key=${process.env.REACT_APP_SERPAPI_KEY}`;

        // Court Listener
        // reference: https://www.courtlistener.com/help/api/rest/#search-endpoint
        const urlCourtListener = `/courtlistener/api/rest/v3/search/?q=${searchTerm}`;

        axios
            .all([
                axios.get(urlScholarsPortal),
                axios.get(urlSerpAPI),
                axios.get(urlCourtListener),
            ])
            .then(
                axios.spread(
                    (resScholarsPortal, resSerpAPI, resCourtListener) => {
                        const results = [];
                        for (const res of resScholarsPortal.data.response
                            .results.result) {
                            //console.log(res);
                            results.push({
                                url: res.url,
                                abstract: res.abstract,
                                title: res.title,
                                type: "secondary",
                            });
                        }
                        for (const res of resSerpAPI.data.organic_results) {
                            //console.log(res);
                            results.push({
                                url: res.link,
                                abstract: res.snippet,
                                title: res.title,
                                type: "primary",
                            });
                        }
                        for (const res of resCourtListener.data.results) {
                            results.push({
                                url:
                                    "https://www.courtlistener.com" +
                                    res.absolute_url,
                                abstract: res.snippet,
                                title: res.caseName,
                                type: "secondary",
                            });
                        }
                        const elasticUrl =
                            process.env.REACT_APP_ELASTICSEARCH_URL;
                        const config = {
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${process.env.REACT_APP_PRIVATE_SEARCH_KEY}`,
                            },
                        };
                        axios.post(elasticUrl, results, config).then((res) => {
                            setTimeout(function () {
                                setSearchTerm(searchTerm);
                            }, 1000);
                        });
                    }
                )
            )
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
                                sideContent={
                                    <div>
                                        <Facet
                                            field="type"
                                            label="Type"
                                            view={SingleLinksFacet}
                                        />
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
                    );
                }}
            </WithSearch>
        </SearchProvider>
    );
};

export default SearchPage;
