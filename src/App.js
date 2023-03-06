import "./App.css";
import ChatPage from "./components/ChatPage";
import SearchPage from "./components/SearchPage";

function App() {
    return (
        <div className="App">
            <SearchPage></SearchPage>
            <ChatPage></ChatPage>
        </div>
    );
}

export default App;
