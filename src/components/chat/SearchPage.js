import React from "react";
import { handleSearch } from "./functions";
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
import "../../App.css";


const SearchPage = ({ wasSearched, setSearchTerm }) => {

    return (
        <ErrorBoundary>
            <Layout
                header={
                    <SearchBox
                        debounceLength={0}
                        onSubmit={(searchTerm) => {
                            handleSearch(searchTerm, setSearchTerm);
                        }}
                    />
                }
                sideContent={
                    <div>
                        <Facet
                            field="source"
                            label="Source"
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
                        // style={{padding: '100px'}}
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
