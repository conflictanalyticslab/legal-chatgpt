import React from "react";
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
  } from "react-router-dom";

import LandingPage from './components/pages/LandingPage';
import ChatPage from './components/pages/ChatPage';


function App() {
    return (
              
        <Routes> {/* The Switch decides which component to show based on the current URL.*/}
            <Route path='/' element={<LandingPage />} />
            <Route path='/chat' element={<ChatPage />} />
        </Routes>
            );
    }

export default App;
