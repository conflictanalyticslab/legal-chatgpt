"use client";

import React, { MouseEventHandler, useEffect, useState } from "react";
import Image from "next/image";

import SearchModal from "@/components/Chat/SearchModal";
import { useRouter } from "next/navigation";
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
  CircularProgress,
  Paper,
  Tooltip,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import { Send, ThumbUp, ThumbDown } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import { Typography } from "@mui/material";

import { auth } from "@/firebase";

import ChatPageOJ from "@/images/ChatPageOJ.png";
import Whatis from "@/images/Whatis.png";
import Howto from "@/images/Howto.png";
import { getAuthenticatedUser } from "@/util/requests/getAuthenticatedUser";
import { postConversation } from "@/util/requests/postConversation";
import { useIncludedDocuments } from "@/hooks/useIncludedDocuments";
import { postConversationMult } from "@/util/requests/postConversationMult";

type FeedbackReasonsI = {
  "Superficial Response": boolean;
  "Lacks Reasoning": boolean;
  "Lacks Relevant Facts": boolean;
  "Lacks Citation": boolean;
};

export function Chat({
  wasSearched,
  setSearchTerm,
}: {
  wasSearched: boolean;
  setSearchTerm: (searchTerm: string) => void;
}) {
  const router = useRouter();
  const { includedDocuments } = useIncludedDocuments();
  const [userInputs, setUserInputs] = useState<string[]>([]);
  const [conversation, setConversation] = useState<
    {
      role: string;
      content: string;
    }[]
  >([]);
  const [responses, setResponses] = useState<
    {
      response: string;
      is_satisfactory: boolean | "N/A";
      feedback: {
        message: string;
        reasons: FeedbackReasonsI;
      };
    }[]
  >([]);
  const [currentInput, setCurrentInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [kwRefs, setKwRefs] = useState<{
    keyword: String;
    refs: { name: String; kwLen: number; excerpts: string[] }[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [endSession, setEndSession] = useState(false);
  const [num, setNum] = useState(-1);
  const [totalQuota, setTotalQuota] = useState(0);

  useEffect(() => {
    setAlert("Authenticating user...");
    getAuthenticatedUser()
      .then((user) => {
        if (user) {
          setNum(user.prompts_left);
          handleAlertClose();
        }
      })
      .catch((e) => {
        router.push("/login");
      });
  }, []);

  const [alert, setAlert] = useState("");

  const [feedbackState, setFeedbackState] = useState<{
    index: number | null;
    dialogOpen: boolean;
    isSatisfactory: boolean | null;
    message: string | null;
  }>({
    index: null,
    dialogOpen: false,
    isSatisfactory: null,
    message: null,
  });
  const [feedbackSelect, setFeedbackSelect] = useState<FeedbackReasonsI>({
    "Superficial Response": false,
    "Lacks Reasoning": false,
    "Lacks Relevant Facts": false,
    "Lacks Citation": false,
  });

  const findRefs = (
    texts: { name: string; text: string }[],
    keyword: string
  ) => {
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
          pos + after < text.text.length ? pos + after : text.text.length;
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
    if (!auth.currentUser) {
      setAlert("Missing auth.currentUser");
      return;
    }

    setLoading(true);

    try {
      const fullConversation = conversation.concat([
        {
          role: "user",
          content: currentInput,  
        },
      ]);
      setConversation(fullConversation);
      setUserInputs(userInputs.concat([currentInput]));
      setCurrentInput("");
      setNum(num - 1);

      let response;
      
      if (conversation.length === 0) {
        response = await postConversationMult(fullConversation);
      } else {
        response = await postConversation(
          fullConversation,
          includedDocuments
        );
      };
      

      if (!response.ok) {
        const errorData = await response.json();
        setAlert(errorData.error);
        setLoading(false);
        return;
      }

      let { latestBotResponse } = await response.json();

      setResponses([
        ...responses,
        {
          response: latestBotResponse,
          is_satisfactory: "N/A",
          feedback: {
            message: "",
            reasons: {
              "Superficial Response": false,
              "Lacks Citation": false,
              "Lacks Reasoning": false,
              "Lacks Relevant Facts": false,
            },
          },
        },
      ]);

      setConversation(
        conversation.concat([{ role: "assistant", content: latestBotResponse }])
      );
    } catch (error) {
      console.error(error);
      setAlert("An unexpected error occured");
    } finally {
      setLoading(false);
    }
  };

  const submitFeedback = () => {
    setResponses(
      responses.map((res, idx) =>
        idx !== feedbackState.index
          ? res
          : {
              ...res,
              feedback: {
                message: feedbackState.message ? feedbackState.message : "",
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

  const handleSave = async () => {
    setSaving(true);
    try {
      // TO DO: Move saving logic to an API route
      //console.log(userInputs, responses);
      // const docRef = await addDoc(collection(db, "conversations"), {
      //   userInputs: userInputs,
      //   responses: responses,
      // });
      // const userDocRef = await updateDoc(
      //   doc(db, "users", auth.currentUser.uid),
      //   { conversations: arrayUnion(docRef.id) }
      // );
      // setAlert(
      //     `Conversation (ID: ${docRef.id}) successfully saved in Firebase.`
      // );
      window.location.reload();
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

  const [showStartupImage, setShowStartupImage] = useState(true);

  useEffect(() => {
    // Check if Startup image flag is already set in session Storage
    const isStartupImageHidden = sessionStorage.getItem("isStartupImageHidden");
    if (isStartupImageHidden === "true") {
      setShowStartupImage(false);
    }
  }, []);

  const hideStartupImage = () => {
    // Set the flag in sessionStorage to hide the image on subsequent text submission
    sessionStorage.setItem("isStartupImageHidden", "true");
    setShowStartupImage(false);
  };

  const handleKeyDownImage = () => {
    hideStartupImage();
  };

  const handleButtonClickImage = () => {
    if (showStartupImage) {
      hideStartupImage();
    }
  };

  const textBoxSubmission = () => {
    handleSubmit();
    handleButtonClickImage();
  };

  const TextFormatter: React.FC<{ text: string }> = ({ text }) => {
    const formattedText = text.replace(/(\d+\.\s+)/g, "<br />$1");
    return (
      <div dangerouslySetInnerHTML={{ __html: formattedText }} />
    );
  }

  const chatActions = [
    {
      id: 1,
      icon: <RefreshIcon />,
      title: "Refresh Conversation",
    },
    {
      id: 2,
      icon: <AddIcon />,
      title: "New Conversation",
    },
    {
      id: 3,
      icon: <CloseIcon />,
      title: "Clear Conversation",
    },
    {
      id: 4,
      icon: <SaveIcon />,
      title: "Save Conversation",
    },
  ] as {
    id: number;
    icon: any;
    onClick?: MouseEventHandler<HTMLButtonElement>;
    title: string;
  }[];

  return (
    <div
      style={{
        width: '100%'
      }}
    >
      <div
        style={{
          display: "flex",
        }}
      >
        {!showStartupImage && (
          <Image
            src={ChatPageOJ}
            style={{
              width: "20%",
              marginLeft: "3rem",
              marginTop: "1rem",
              maxHeight: "auto",
              objectFit: "contain",
            }}
            alt="Open Justice Powered by the Conflict Analytics Lab"
          />
        )}
        <SearchModal wasSearched={wasSearched} setSearchTerm={setSearchTerm} />
      </div>
      <div
        style={{
          paddingBlock: 32,
          paddingInline: 60,
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        {showStartupImage && (
          <div style={{ marginTop: "10rem" }}>
            <Image
              src={ChatPageOJ}
              style={{
                display: "block",
                margin: "auto",
                maxWidth: "25%",
                maxHeight: "auto",
                objectFit: "contain",
                marginBottom: "2rem",
              }}
              alt="Open Justice Powered by the Conflict Analytics Lab"
            />
            <div style={{ margin: "auto", width: "35%" }}>
              <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                <Image
                  src={Whatis}
                  style={{ marginRight: "27px" }}
                  alt="Question marks"
                  height={30}
                  width={30}
                />
                What is AI?
              </Typography>
              <p style={{ textAlign: "justify", marginTop: "0px" }}>
                AI, or Artificial Intelligence, refers to the simulation of
                human intelligence in machines that are programmed to perform
                tasks that normally require human intelligence, such as speech
                recognition, decision-making, and natural language processing.
              </p>

              <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                <Image
                  src={Howto}
                  style={{ marginRight: "27px" }}
                  alt="Text bubbles"
                  height={30}
                  width={30}
                />
                How to use OpenJustice
              </Typography>
              <p style={{ textAlign: "justify", marginTop: "0px" }}>
                OpenJustice can help you with a wide variety of tasks, including
                answering legal questions, providing information on your case,
                and more. To use OpenJustice, simply type your question or
                prompt in the chat box and it will generate a response for you.
              </p>
            </div>
          </div>
        )}

        <div
          style={{
            height: "calc(100vh - 280px)",
            overflowY: "auto",
            width: "100%",
            paddingBlockStart: 20,
            paddingBottom: 200,
            scrollbarGutter: "stable",
          }}
        >
          {userInputs &&
            userInputs.map((input, i) => (
              <div key={input}>
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
                          OpenJustice:
                        </strong>
                        {/* {(responses[i].response).replace(/(\d+\.\s+)/g, "$1\n")} */}
                        <TextFormatter text= {responses[i].response} /> 
                      </div>

                      {responses[i].is_satisfactory === "N/A" ? (
                        <ButtonGroup>
                          <IconButton
                            onClick={() => {
                              setResponses(
                                responses.map((res, idx) =>
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
                                message: null,
                              });
                              setKwRefs(null);
                            }}
                          >
                            <ThumbUp />
                          </IconButton>
                          <IconButton
                            onClick={() => {
                              setResponses(
                                responses.map((res, idx) =>
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
                                message: null,
                              });
                            }}
                          >
                            <ThumbDown />
                          </IconButton>
                        </ButtonGroup>
                      ) : (
                        <IconButton disabled>
                          {responses[i].is_satisfactory ? (
                            <ThumbUp />
                          ) : (
                            <ThumbDown />
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

        <Paper
          elevation={1}
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
                // fullWidth
                style={{ width: "95%", margin: "auto", display: "flex" }}
                required
                placeholder="Prompt"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleSubmit();
                    handleKeyDownImage();
                  }
                }}
                multiline={true}
                maxRows={4}
                endAdornment={
                  <InputAdornment position="end">
                    <LoadingButton
                      onClick={textBoxSubmission}
                      loading={loading}
                    >
                      <Send></Send>
                    </LoadingButton>
                  </InputAdornment>
                }
              ></OutlinedInput>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <p
                  style={{
                    fontStyle: "italic",
                    fontSize: 14,
                    color: "gray",
                    marginLeft: "1.5rem",
                  }}
                >
                  {num === 0
                    ? "No more prompts allowed. Please enter your final feedback."
                    : `Prompts left: ${num}`}
                </p>

                <div>
                  {chatActions.map((action) => (
                    <Tooltip title={action.title}>
                      <IconButton
                        key={action.id}
                        onClick={action.onClick}
                        style={{ marginRight: "24px" }}
                      >
                        {action.icon}
                      </IconButton>
                    </Tooltip>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <></>
          )}
        </Paper>

        <Dialog open={!!alert} onClose={handleAlertClose}>
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
                      key={key}
                      control={
                        <Checkbox
                          checked={
                            feedbackSelect[key as keyof FeedbackReasonsI]
                          }
                          onChange={(e) =>
                            setFeedbackSelect({
                              ...feedbackSelect,
                              [e.target.name]: e.target.checked,
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
    </div>
  );
}
