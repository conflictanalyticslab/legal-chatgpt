import React from "react";
import "../App.css";
import SearchPage from "./chat/SearchPage";
import Chat from "./chat/Chat";
import AppSearchAPIConnector from "@elastic/search-ui-app-search-connector";
import { SearchProvider, WithSearch } from "@elastic/react-search-ui";
import SideBar from "./chat/SideBar";


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
            source: { raw: {} },
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
        disjunctiveFacets: ["source"],
        facets: { source: { type: "value", size: 30 } },
    },
};


export var loggedin = true;

function ChatPage() {
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
                            {/* <div>
                                <button onClick={toggleMenu}>Toggle Menu</button>
                                <SideMenu isOpen={isMenuOpen} onClose={toggleMenu} />
                            </div> */}
                            <SideBar />
                            <div
                                style={{
                                    width: "70%",
                                    height: "100%",
                                    overflow: "scroll",
                                    justifyContent: "center",
                                    diplay: 'flex',
                                    backgroundColor: "#F5F5F7"
                                }}
                            >
                                <Chat
                                    setSearchTerm={setSearchTerm}
                                    // loggedin={loggedin}
                                >
                                </Chat>
                            </div>
                            <div
                                style={{
                                    width: "30%",
                                    height: "%100%",
                                    overflow: "scroll",
                                }}
                            >
                                <SearchPage
                                    wasSearched={wasSearched}
                                    setSearchTerm={setSearchTerm}
                                ></SearchPage>
                            </div>
                            
                        </div>
                    );
                }}
            </WithSearch>
        </SearchProvider>
    );
}

export default ChatPage;
