import React from "react";
import "./App.css";
import ChatPage from "./components/ChatPage";
import SearchPage from "./components/SearchPage";
import AppSearchAPIConnector from "@elastic/search-ui-app-search-connector";
import { SearchProvider, WithSearch } from "@elastic/react-search-ui";

import { auth } from "./firebase";

import { onAuthStateChanged, setPersistence, browserLocalPersistence } from "firebase/auth";
import {
    Routes,
    Route,
    useLocation,
    redirect,
    useNavigate,
    useLoaderData,
    useRouteLoaderData,
    Navigate
  } from "react-router-dom";

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

function LoadPage() {
    return (<SearchProvider config={config}>
            <WithSearch
                mapContextToProps={({ wasSearched, setSearchTerm }) => ({
                    wasSearched,
                    setSearchTerm,
                })}
            >
                {({ wasSearched, setSearchTerm }) => {
                    return (
                        <div className="App">
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
                            <div
                                style={{
                                    width: "70%",
                                    height: "100%",
                                    overflow: "scroll",
                                    justifyContent: "center",
                                }}
                            >
                                <ChatPage
                                    setSearchTerm={setSearchTerm}
                                    // loggedin={loggedin}
                                ></ChatPage>
                            </div>
                        </div>
                    );
                }}
            </WithSearch>
        </SearchProvider>);
}

function App() {
    // return docSnap.data();

    setPersistence(auth, browserLocalPersistence);
    onAuthStateChanged(auth, (user) => {
        console.log('auth state changed');
        // console.log(user)
          if (user) {
            // User is signed in, see docs for a list of available properties
            // https://firebase.google.com/docs/reference/js/firebase.User
    
            // ...
          } else {
            // User is signed out
            // ...
            window.location.replace('https://' + process.env.REACT_APP_LOGIN_REDIRECT_URL );
          }
      });

      const ChatRoute = () => {
  
        window.location.replace('https://' + process.env.REACT_APP_LOGIN_REDIRECT_URL );
        return null; 
      
      };
    return (
        <Routes> {/* The Switch decides which component to show based on the current URL.*/}
            <Route path='/' id="root" loader={() => {    console.log(auth.currentUser);}} element={<LoadPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
            <Route onEnter={() => window.location.reload()} />
        </Routes>
            );
}

export default App;
