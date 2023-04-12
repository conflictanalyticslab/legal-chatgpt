import React, { useState } from "react";
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
    FormGroup,
    FormControlLabel,
    FormControl,
    Checkbox,
    DialogTitle,
    CircularProgress,
} from "@mui/material";
import { Send, ThumbUp, ThumbDown, Refresh, Save } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";

import { db } from "../firebase";
import { addDoc, collection } from "firebase/firestore";
import { dummyData } from "../dummyData";

function ChatPage() {
    const [userInputs, setUserInputs] = useState([]);
    const [conversation, setConversation] = useState([]);
    const [responses, setResponses] = useState([]);
    const [currentInput, setCurrentInput] = useState("");
    const [keyword, setKeyword] = useState("");
    const [kwRefs, setKwRefs] = useState(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [endSession, setEndSession] = useState(false);
    const [num, setNum] = useState(10);
    const [alert, setAlert] = useState("");
    const [feedbackState, setFeedbackState] = useState({
        index: null,
        dialogOpen: false,
        isSatisfactory: null,
        message: null,
    });
    const [feedbackSelect, setFeedbackSelect] = useState({
        "Superficial Response": false,
        "Lacks Reasoning": false,
        "Lacks Relevant Facts": false,
        "Lacks Citation": false,
    });

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
        const newConversation = [
            ...conversation,
            { role: "user", content: currentInput },
        ];
        setConversation(newConversation);
        setCurrentInput("");
        setKeyword("");
        setNum(num - 1);
        //console.log(newConversation);
        if (num > 0) {
            await query({
                model: "gpt-3.5-turbo",
                messages: newConversation,
            }).then((res) => {
                console.log(res);
                setResponses([
                    ...responses,
                    {
                        response: res.choices[0].message.content,
                        is_satisfactory: "N/A",
                        feedback: "N/A",
                    },
                ]);
                setConversation([...newConversation, res.choices[0].message]);
            });
        }

        setLoading(false);
    };

    const submitFeedback = () => {
        setResponses(
            responses.map((res, idx) =>
                idx !== feedbackState.index
                    ? res
                    : {
                          ...res,
                          feedback: {
                              message: feedbackState.message
                                  ? feedbackState.message
                                  : "",
                              reasons: feedbackSelect,
                          },
                      }
            )
        );
        setFeedbackState({
            index: null,
            dialogOpen: false,
            isSatisfactory: true,
            message: null,
        });
    };
    const extractUserInput = (convo) => {
        const userInput = [];
        for (let i = 0; i < convo.length; i++) {
            if (convo[i]["role"] === "user") {
                userInput.push(convo[i]["content"]);
            }
        }
        return userInput;
    };

    const handleSave = async () => {
        console.log({ userInputs, responses });
        setSaving(true);
        try {
            //console.log(userInputs, responses);
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
    const handleFeedbackClose = () => {
        setFeedbackState({ ...feedbackState, dialogOpen: false });
    };
    const query = async (data) => {
        const response = await fetch(
            "https://api.openai.com/v1/chat/completions",
            {
                headers: {
                    Authorization: `Bearer ${process.env.REACT_APP_MODEL_API_KEY}`,
                    "Content-Type": "application/json",
                },
                method: "POST",
                body: JSON.stringify(data),
            }
        );
        const result = await response.json();
        return result;
    };

    return (
        <div
            style={{
                paddingBlock: 32,
                paddingInline: 60,
                display: "flex",
                justifyContent: "center",
            }}
        >
            <div
                style={{
                    position: "absolute",
                    right: 50,
                    zIndex: 10,
                    display: "flex",
                    flexDirection: "row",
                }}
            >
                <LoadingButton
                    onClick={handleSave}
                    loading={saving}
                    variant="contained"
                    endIcon={<Save></Save>}
                    style={{ marginRight: 10 }}
                >
                    Save Conversation
                </LoadingButton>
                <Button
                    variant="contained"
                    onClick={() => window.location.reload()}
                    endIcon={<Refresh></Refresh>}
                >
                    Start Over
                </Button>
            </div>
            <div
                style={{
                    maxHeight: 800,
                    overflow: "scroll",
                    width: "100%",
                    paddingBlockStart: 20,
                }}
            >
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
                                                        setFeedbackState({
                                                            index: i,
                                                            dialogOpen: true,
                                                            isSatisfactory: true,
                                                        });
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
                                                        setFeedbackState({
                                                            index: i,
                                                            dialogOpen: true,
                                                            isSatisfactory: false,
                                                        });
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
                {/* <div
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
                </div> */}
                {loading && <CircularProgress></CircularProgress>}
            </div>

            <div
                style={{
                    position: "fixed",
                    bottom: "50px",
                    width: "60%",
                    alignSelf: "center",
                }}
            >
                {!endSession && num >= 0 ? (
                    <>
                        {/* <TextField
                            label="Keyword"
                            variant="standard"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === "Enter") {
                                    handleSubmit();
                                }
                            }}
                        /> */}
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
                    <></>
                )}
            </div>
            <Dialog open={alert} onClose={handleAlertClose}>
                <DialogContent>
                    <DialogContentText>{alert}</DialogContentText>
                </DialogContent>
            </Dialog>
            <Dialog
                open={feedbackState.dialogOpen}
                onClose={handleFeedbackClose}
                fullWidth
            >
                <DialogContent
                    style={{
                        display: "flex",
                        alignItems: "center",
                        flexDirection: "column",
                    }}
                >
                    <h3>Provide additional feedback</h3>
                    <TextField
                        fullWidth
                        label={
                            feedbackState.isSatisfactory
                                ? "What do you like about the response?"
                                : "What was the issue with the response? How could it be improved?"
                        }
                        variant="outlined"
                        multiline
                        value={feedbackState.message}
                        onChange={(e) =>
                            setFeedbackState({
                                ...feedbackState,
                                message: e.target.value,
                            })
                        }
                    />
                    {!feedbackState.isSatisfactory && (
                        <FormControl component="fieldset" variant="standard">
                            <FormGroup>
                                {Object.keys(feedbackSelect).map((key) => (
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={feedbackSelect[key]}
                                                onChange={(e) =>
                                                    setFeedbackSelect({
                                                        ...feedbackSelect,
                                                        [e.target.name]:
                                                            e.target.checked,
                                                    })
                                                }
                                                name={key}
                                            ></Checkbox>
                                        }
                                        label={key}
                                    ></FormControlLabel>
                                ))}
                            </FormGroup>
                        </FormControl>
                    )}
                    <br></br>
                    <Button variant="contained" onClick={submitFeedback}>
                        Submit feedback
                    </Button>
                    <br></br>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default ChatPage;
