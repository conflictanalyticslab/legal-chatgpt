import "./App.css";
import { useState } from "react";
import {
    Button,
    ButtonGroup,
    Dialog,
    DialogContent,
    DialogContentText,
    Divider,
    IconButton,
    TextField,
    InputAdornment,
    OutlinedInput,
} from "@mui/material";
import { Send, ThumbUp, ThumbDown, Refresh, Search } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";

import { db } from "./firebase";
import { addDoc, collection } from "firebase/firestore";
import { dummyData } from "./dummyData";
import ChatPage from "./components/ChatPage";
import SearchPage from "./components/SearchPage";

function App() {
    const [userInputs, setUserInputs] = useState([]);
    const [responses, setResponses] = useState([]);
    const [currentInput, setCurrentInput] = useState("");
    const [keyword, setKeyword] = useState("");
    const [kwRefs, setKwRefs] = useState(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [endSession, setEndSession] = useState(false);
    const [num, setNum] = useState(2);
    const [alert, setAlert] = useState("");

    const findRefs = (texts, keyword) => {
        var allRefs = [];
        for (const text of texts) {
            var indexes = [];
            var excerpts = [];
            const textLower = text.text.toLowerCase();
            var pos = textLower.indexOf(keyword);
            const kwLen = keyword.length;
            const prev = 300;
            const after = 500;
            while (pos !== -1) {
                indexes.push(pos);
                const start = pos - prev > -1 ? pos - prev : 0;
                const end =
                    pos + after < text.text.length
                        ? pos + after
                        : text.text.length;
                excerpts.push(text.text.substring(start, end));
                pos = text.text.indexOf(keyword, pos + 1);
            }
            indexes.length > 0 &&
                allRefs.push({
                    name: text.name,
                    kwLen: kwLen,
                    excerpts: excerpts,
                });
        }
        return allRefs;
    };

    const handleSubmit = async () => {
        setLoading(true);
        setKwRefs(null);
        //console.log(findRefs(dummyData, keyword.toLowerCase()));

        keyword &&
            setKwRefs({
                keyword: keyword,
                refs: findRefs(dummyData, keyword.toLowerCase()),
            });
        setUserInputs([...userInputs, currentInput]);
        setCurrentInput("");
        setKeyword("");
        setNum(num - 1);
        if (num > 0) {
            await query({
                inputs: {
                    past_user_inputs: userInputs,
                    generated_responses: responses.map((res) => res.response),
                    text: currentInput,
                },
            }).then((res) => {
                setResponses([
                    ...responses,
                    {
                        response: res.generated_text ? res.generated_text : "",
                        is_satisfactory: "N/A",
                    },
                ]);
            });
        }

        setLoading(false);
    };

    const handleSave = async () => {
        // console.log({ userInputs, responses });
        setSaving(true);
        try {
            console.log(userInputs, responses);
            const docRef = await addDoc(collection(db, "conversations"), {
                userInputs: userInputs,
                responses: responses,
            });
            setAlert(
                `Conversation (ID: ${docRef.id}) successfully saved in Firebase.`
            );
        } catch (e) {
            setAlert(`Error saving conversation: ${e}`);
        }
        setSaving(false);
    };
    const handleAlertClose = () => {
        setAlert("");
    };
    const query = async (data) => {
        const response = await fetch(
            "https://api-inference.huggingface.co/models/microsoft/DialoGPT-large",
            {
                headers: {
                    Authorization: `Bearer ${process.env.REACT_APP_MODEL_API_KEY}`,
                },
                method: "POST",
                body: JSON.stringify(data),
            }
        );
        const result = await response.json();
        return result;
    };

    return (
        <div className="App">
            <SearchPage></SearchPage>
            <ChatPage></ChatPage>
        </div>
    );
}

export default App;
