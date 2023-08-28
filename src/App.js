import React from "react";
import "./App.css";
import AppSearchAPIConnector from "@elastic/search-ui-app-search-connector";
import { SearchProvider, WithSearch } from "@elastic/react-search-ui";

import { auth } from "./firebase";
import LoginPage from './components/LoginPage';
import LandingPage from "./components/LandingPage";
import ChatPage from "./components/ChatPage";

import { onAuthStateChanged, setPersistence, browserSessionPersistence, signInWithCustomToken } from "firebase/auth";
import {
    Routes,
    Route,
    useLocation,
    redirect,
    useNavigate,
    useLoaderData,
    useRouteLoaderData,
    Navigate,
    useSearchParams
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

function App() {
    // return docSnap.data();
    const [authToken, setAuthToken] = useSearchParams();

    onAuthStateChanged(auth, (user) => {
        console.log('auth state changed');
        // console.log(user)
          if (user) {
            // User is signed in, see docs for a list of available properties
            // https://firebase.google.com/docs/reference/js/firebase.User
            console.log('signed in')
    
            // ...
          } else {
            // User is signed out
            // ...
            console.log('signed out')
          }
      });
    return (
        <Routes> {/* The Switch decides which component to show based on the current URL.*/}
            <Route path='/' element={<LandingPage />} />
            <Route path='/chat' loader={() => console.log("User: " +  auth.currentUser.email)} element={<ChatPage />} />
            
            <Route path="/login" loader={() => console.log("Email verified: " +  auth.currentUser.emailVerified)} element={<LoginPage />} />
            
            <Route path="*" element={<Navigate to="/" replace />} />
            <Route onEnter={() => window.location.reload()} />
        </Routes>
            );
}

export default App;
