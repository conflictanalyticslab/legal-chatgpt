import React from "react";
import "./App.css";
import ChatPage from "./components/ChatPage";
import SearchPage from "./components/SearchPage";

function App() {
    return (
        <div className="App">
            <div style={{ width: "30%", height: "%100%", overflow: "scroll" }}>
                <SearchPage></SearchPage>
            </div>
            <div
                style={{
                    width: "70%",
                    height: "100%",
                    overflow: "scroll",
                    justifyContent: "center",
                }}
            >
                <ChatPage></ChatPage>
            </div>
        </div>
    );
}

export default App;
