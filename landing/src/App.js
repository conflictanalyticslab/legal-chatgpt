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
    useLocation,
    redirect,
  } from "react-router-dom";

import LandingPage from './components/pages/LandingPage';
// import ChatPage from './components/pages/ChatPage';

function NoMatch() {
    let location = useLocation();
  
    return (
      <div>
        <h3>
          No match for <code>{location.pathname}</code>
        </h3>
      </div>
    );
  }

const ChatRoute = () => {
    window.location.replace('https://chat.openjustice.ai');
    return null; };
  
function App() {
    return (
              
        <Routes> {/* The Switch decides which component to show based on the current URL.*/}
            <Route path='/' element={<LandingPage />} />

            <Route path='/chat' element={<ChatRoute />} />
            
            <Route component={NoMatch} />
            <Route onEnter={() => window.location.reload()} />
        </Routes>
            );
    }

export default App;
