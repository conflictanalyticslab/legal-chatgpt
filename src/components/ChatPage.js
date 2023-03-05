import "../App.css";
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
import { Send, ThumbUp, ThumbDown, Refresh } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";

import { db } from "../firebase";
import { addDoc, collection } from "firebase/firestore";
import { dummyData } from "../dummyData";

function ChatPage() {
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
            <div>
                <Button
                    variant="contained"
                    style={{ position: "absolute", right: 200, zIndex: 10 }}
                    onClick={() => window.location.reload()}
                    endIcon={<Refresh></Refresh>}
                >
                    Start Over
                </Button>
            </div>
            <div style={{ width: "100%", maxHeight: 650, overflow: "scroll" }}>
                {userInputs &&
                    userInputs.map((input, i) => (
                        <div>
                            {i !== 0 && <Divider></Divider>}
                            <div
                                style={{
                                    marginBlock: 40,
                                    overflowWrap: "break-word",
                                }}
                            >
                                <strong
                                    style={{
                                        marginRight: 10,
                                    }}
                                >
                                    You:
                                </strong>
                                {input}
                            </div>

                            {i < responses.length && (
                                <>
                                    <Divider></Divider>
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            marginBlock: 32,
                                            overflowWrap: "break-word",
                                        }}
                                    >
                                        <div>
                                            <strong
                                                style={{
                                                    marginRight: 10,
                                                }}
                                            >
                                                Bot:
                                            </strong>
                                            {responses[i].response}
                                        </div>

                                        {responses[i].is_satisfactory ===
                                        "N/A" ? (
                                            <ButtonGroup>
                                                <IconButton
                                                    onClick={() => {
                                                        setResponses(
                                                            responses.map(
                                                                (res, idx) =>
                                                                    idx !== i
                                                                        ? res
                                                                        : {
                                                                              ...res,
                                                                              is_satisfactory: true,
                                                                          }
                                                            )
                                                        );
                                                        setEndSession(true);
                                                        setKwRefs(null);
                                                    }}
                                                >
                                                    <ThumbUp></ThumbUp>
                                                </IconButton>
                                                <IconButton
                                                    onClick={() => {
                                                        setResponses(
                                                            responses.map(
                                                                (res, idx) =>
                                                                    idx !== i
                                                                        ? res
                                                                        : {
                                                                              ...res,
                                                                              is_satisfactory: false,
                                                                          }
                                                            )
                                                        );
                                                        setCurrentInput(
                                                            "I don't like this answer. "
                                                        );
                                                    }}
                                                >
                                                    <ThumbDown></ThumbDown>
                                                </IconButton>
                                            </ButtonGroup>
                                        ) : (
                                            <IconButton disabled>
                                                {responses[i]
                                                    .is_satisfactory ? (
                                                    <ThumbUp></ThumbUp>
                                                ) : (
                                                    <ThumbDown></ThumbDown>
                                                )}
                                            </IconButton>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                <div
                    style={{
                        maxHeight: 400,
                        overflow: "scroll",
                        color: "gray",
                    }}
                >
                    {kwRefs &&
                        (kwRefs.refs.length !== 0 ? (
                            <div>
                                <p>{`Found ${kwRefs.refs
                                    .map((ref) => ref.excerpts.length)
                                    .reduce((a, b) => a + b)} matches`}</p>
                                {kwRefs.refs.map((ref) =>
                                    ref.excerpts.map((excerpt) => (
                                        <div style={{}}>
                                            <i>{ref.name}</i>
                                            <p>
                                                {'"...' +
                                                    excerpt.substring(0, 300)}
                                                <strong
                                                    style={{ color: "black" }}
                                                >
                                                    {excerpt.substring(
                                                        300,
                                                        300 + ref.kwLen
                                                    )}
                                                </strong>
                                                {excerpt.substring(
                                                    300 + ref.kwLen
                                                ) + '..."'}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>
                        ) : (
                            <i>No references found</i>
                        ))}
                </div>
            </div>

            <div
                style={{
                    position: "fixed",
                    bottom: "60px",
                    width: "80%",
                }}
            >
                {!endSession && num >= 0 ? (
                    <>
                        <TextField
                            label="Keyword"
                            variant="standard"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === "Enter") {
                                    handleSubmit();
                                }
                            }}
                        />
                        <div style={{ height: 20 }}></div>
                        <OutlinedInput
                            fullWidth
                            required
                            placeholder="Prompt"
                            value={currentInput}
                            onChange={(e) => setCurrentInput(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === "Enter") {
                                    handleSubmit();
                                }
                            }}
                            endAdornment={
                                <InputAdornment>
                                    <LoadingButton
                                        onClick={handleSubmit}
                                        loading={loading}
                                    >
                                        <Send></Send>
                                    </LoadingButton>
                                </InputAdornment>
                            }
                        ></OutlinedInput>{" "}
                        <p
                            style={{
                                fontStyle: "italic",
                                fontSize: 14,
                                color: "gray",
                            }}
                        >
                            {num === 0
                                ? "No more prompts allowed. Please enter your final feedback."
                                : `Prompts left: ${num}`}
                        </p>
                    </>
                ) : (
                    <LoadingButton
                        onClick={handleSave}
                        loading={saving}
                        variant="contained"
                    >
                        Save Conversation
                    </LoadingButton>
                )}
            </div>
            <Dialog open={alert} onClose={handleAlertClose}>
                <DialogContent>
                    <DialogContentText>{alert}</DialogContentText>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default ChatPage;
