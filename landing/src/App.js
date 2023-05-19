import React, { useState } from "react";
import "./App.css";
// import Main from "./components/Main";
import WebFont from "webfontloader";
WebFont.load({google: {families: ["Roboto:300,400,500"]}});
// import '@fontsource/roboto/300.css';
// import '@fontsource/roboto/400.css';
// import '@fontsource/roboto/500.css';
// import '@fontsource/roboto/700.css';
// import CssBaseline from '@mui/material/CssBaseline';
import {
    Routes,
    Route,
    useLocation,
    redirect,
    useLoaderData,
    Navigate
  } from "react-router-dom";

import LoginPage from './components/pages/LoginPage';
import LandingPage from './components/pages/LandingPage';
import { onAuthStateChanged, setPersistence, browserLocalPersistence } from "firebase/auth";


import { auth } from "./firebase";



function App() {

  var current_user = null;
  const ChatRoute = () => {
  
    window.location.replace('https://' + process.env.REACT_APP_LOGIN_REDIRECT_URL );
    return null; 
  
  };
  onAuthStateChanged(auth, (user) => {
    console.log('auth state changed');
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        const uid = user.uid;
        auth.updateCurrentUser(user);

        // ...
      } else {
        // User is signed out
        // ...
      }
  });
    return (
        <Routes> {/* The Switch decides which component to show based on the current URL.*/}
            <Route path='/' element={<LandingPage />} />
            <Route path="/login" loader={() => console.log(auth.currentUser)} element={auth.currentUser ? <ChatRoute /> : <LoginPage />} />
            
            <Route path="*" element={<Navigate to="/" replace />} />
            <Route onEnter={() => window.location.reload()} />
        </Routes>
            );
    }

export default App;
