"use client";

import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";

// import external components
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
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormHelperText from '@mui/material/FormHelperText';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import AttachFileIcon from '@mui/icons-material/AttachFile';
// import RefreshIcon from "@mui/icons-material/Refresh";
// import AddIcon from "@mui/icons-material/Add";
// import CloseIcon from "@mui/icons-material/Close";
// import SaveIcon from "@mui/icons-material/Save";
import { Send, ThumbUp, ThumbDown } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import { Typography } from "@mui/material";
import GPT4Tokenizer from 'gpt4-tokenizer';
import ReactMarkdown from 'react-markdown'

// import external hooks
import { auth } from "@/firebase";

// import images
import ChatPageOJ from "@/images/ChatPageOJ.png";
import Whatis from "@/images/Whatis.png";
import Howto from "@/images/Howto.png";
import { getAuthenticatedUser } from "@/util/requests/getAuthenticatedUser";
import { postConversation } from "@/util/requests/postConversation";
import { postSearchTerms} from "@/util/requests/postSearchTerms";
// uncomment the following when working on pdf upload
import { uploadPdfDocument } from "@/util/requests/uploadPdfDocument";
import { useFilePicker } from "use-file-picker";
import {
  FileAmountLimitValidator,
  FileSizeValidator,
} from "use-file-picker/validators";

// import OJ hooks
import { postConversationSave } from "@/util/requests/postConversationSave";
// import { IncludedDocumentsProvider, useIncludedDocuments } from "@/hooks/useIncludedDocuments"; // passing props instead
// import { postConversationMult } from "@/util/requests/postConversationMult";
import { getConversationTitles } from "@/util/requests/getConversationTitles";
import { getConversation } from "@/util/requests/getConversation";
import { putConversationSave } from "@/util/requests/putConversationSave";
import { postConversationTitle } from "@/util/requests/postConversationTitle";
import { postPDF } from "@/util/requests/postPDF";
import { postWebUrl } from "@/util/requests/postWebUrl";
// import ConversationContext from './ConversationContext';

// import OJ components
import {
  UserDocument,
  getDocumentsOwnedByUser,
} from "@/util/requests/getDocumentsOwnedByUser";
type FeedbackReasonsI = {
  "Superficial Response": boolean;
  "Lacks Reasoning": boolean;
  "Lacks Relevant Facts": boolean;
  "Lacks Citation": boolean;
};
import SearchModal from "@/components/Chat/SearchModal";
import PDFModal from "@/components/Chat/PDFModal";
import {deleteDocument} from "@/util/api/deleteDocument";
import { set } from "firebase/database";
// import { create } from "domain";
// import { stringify } from "querystring";
// import { doc } from "firebase/firestore";
// import { set } from "firebase/database";

export function Chat({
  wasSearched,
  setSearchTerm,
}: {
  wasSearched: boolean;
  setSearchTerm: (searchTerm: string) => void;
}) {
  const router = useRouter();
  const [userInputs, setUserInputs] = useState<string[]>([]);
  const [conversation, setConversation] = useState<
    {
      role: string;
      content: string;
    }[]
  >([]);
  // const [convTitle, setConvTitle] = useState("");
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
  const [latestResponse, setLatestResponse] = useState("");
  const [currentInput, setCurrentInput] = useState("");
  const [documentContent, setDocumentContent] = useState("");
  // const [keyword, setKeyword] = useState("");
  const [kwRefs, setKwRefs] = useState<{
    keyword: String;
    refs: { name: String; kwLen: number; excerpts: string[] }[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [endSession, setEndSession] = useState(false);
  const [num, setNum] = useState(-1);
  const [conversationTitles, setConversationTitles] = useState<{title: string, uid: string}[]>([]);
  const [conversationTitle, setConversationTitle] = useState<string>("");
  // const [totalQuota, setTotalQuota] = useState(0);
  const [includedDocuments, setIncludedDocuments] = useState<string[]>([]);
  const [conversationUid, setConversationUid] = useState<string | null>("");
  const [newConv, setNewConv] = useState(true);
  const [generating, setGenerating] = useState(true);
  
  const generatingRef = useRef(generating);

  useEffect(() => {
    setAlert("Authenticating user...");
    getAuthenticatedUser()
      .then((user) => {
        if (user) {
          setNum(user.prompts_left);
          handleAlertClose();
        }
      })
      .then(() => {
        // fetch documents from db and set state after authentication
        const fetchData = async () => {
          try {
            setDocuments((await getDocumentsOwnedByUser()) as any);
            setConversationTitles((await getConversationTitles()) as any);
          } catch (e) {
            console.log(e);
            // router.push("/login");
          }
        };
        fetchData();
      })
      .catch((e) => {
        console.error(e);
        router.push("/login");
      });
    console.log("generatingRef.current: " + generatingRef.current)
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setConversationTitles((await getConversationTitles()) as any)
        const conversationData = await getConversation(conversationTitle);
        if (conversationData && !newConv) {
          console.log(conversationData)
          setConversation(conversationData.conversation);
          setIncludedDocuments(conversationData.hasOwnProperty('includedDocuments') ? conversationData.documents : []);
          setConversationUid(conversationData.conversationId);
          const tempInputs: string[] = [];
          const tempResponses: {
            response: string;
            is_satisfactory: boolean | "N/A";
            feedback: {
              message: string;
              reasons: FeedbackReasonsI;
            };
          }[] = [];
          // setUserInputs(tempInputs);
          // setResponses(tempResponses);
          console.log("conversationData: " + JSON.stringify(conversationData))
          for (let i = 0; i < conversationData.conversation.length; i++) {
            if (conversationData.conversation[i].role === "user") {
              tempInputs.push(conversationData.conversation[i].content);
            } else if (conversationData.conversation[i].role === "assistant") {
              console.log(`conversationData.conversation[${i}].content: ` + conversationData.conversation[i].content)
              tempResponses.push({"response": conversationData.conversation[i].content, "is_satisfactory": "N/A", "feedback": {"message": "", "reasons": {"Superficial Response": false, "Lacks Citation": false, "Lacks Reasoning": false, "Lacks Relevant Facts": false}}});
            }
          }
          if (conversationData.conversation[conversationData.conversation.length-1].role === "user") {
            tempInputs.pop();
          }
          setUserInputs(tempInputs);
          setResponses(tempResponses);
          setLatestResponse(conversationData.conversation[conversationData.conversation.length-1].role === "assistant"? conversationData.conversation[conversationData.conversation.length-1].content : "");
          console.log("tempInputs: " + tempInputs);
          console.log("tempResponses: " + JSON.stringify(tempResponses));
        }
      } catch (e){
          console.log(e);
        // router.push("/login");
      }
    };
    fetchData();
    
  }, [conversationTitle]);

  // useEffect(() => {
  //   console.log("responses: " + JSON.stringify(responses));
  // }, [responses]);

  useEffect(() => {
    if (responses.length > 0 && latestResponse.length > responses[responses.length-1].response.length) {
      setResponses([...responses.slice(0,responses.length-1), {
        response: latestResponse,
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
      }])
    }
    else {setResponses([...responses, {
      response: latestResponse,
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
    }])}
    // console.log(responses);
    }, [latestResponse]);

    // updates conversation in db whenever conversation state is updated
    // useEffect(() => {
    //   if (conversationUid) {
    //     try {
    //       putConversationSave(conversationUid, conversation, includedDocuments, conversationTitle);
    //     } catch (e) {
    //       console.error(e);
    //     }
    //   }
    // }, [conversation]);

    useEffect(() => {
      generatingRef.current = generating;
    }, [generating]);

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

  const [documents, setDocuments] = useState<UserDocument[]>([]);

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       setDocuments((await getDocumentsOwnedByUser()) as any);
  //     } catch (e) {
  //       console.log(e);
  //       // router.push("/login");
  //     }
  //   };

  //   fetchData();
  // }, []);

  // handle delete documents from PDFModal
  const deleteDocumentChat = (uid: string) => {
    deleteDocument(uid).then(() => setDocuments(documents.filter((doc) => doc.uid !== uid))).then(() => {console.log("PDF deleted successfully")}).catch((err) => {console.log("Error when deleting PDF, " + err)});
  }

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

  const getUrls = (text: string) => {
    const urlRegex = /(https?:\/\/)?([A-Za-z_0-9.-]+[.][A-Za-z]{2,})(\/[A-Za-z0-9-._~:\/\?#\[\]@!$&'()*+,;=]*)?/g;
    let match;
    const urls = [];
    while (match = urlRegex.exec(text)) {
        urls.push(match[0]);
    }
    return urls;
}

  const isValidUrl = (string: string) => {
    try {
        new URL(string);
    } catch (_) {
        return false;  
    }

    return true;
  }

  const handleSubmit = async () => {
    if (!auth.currentUser) {
      setAlert("Missing auth.currentUser");
      return;
    }

    setLoading(true);

    let urls = getUrls(currentInput);

    for (let url of urls) {
      if (!url.includes("http") || !url.includes("https")) {
        url = "https://" + url;
      }
      if (!isValidUrl(url)) {
        setAlert("Invalid URL: " + url);
        setLoading(false);
        return;
      }
    }

    let urlContent;
    let urlContentUserInput = currentInput;

    for (const url of urls) {
      try {
        urlContent = await postWebUrl(url);
        // console.log(urlContent.text);
        urlContentUserInput = urlContentUserInput.replace(url, urlContent.text);
      } catch (error: any) {
        console.error(error);
        if (error.message.includes("400")) {
          console.log(error.status);
          createAlert("Error fetching content from URL: " + url + " doesn't allow web scraping!");
        } else {
          createAlert("Error fetching content from URL: " + url + ", Please check the URL spelling and try again");
        }
        
        setLoading(false);
        return;
      }
    }

    setCurrentInput("");

    console.log(currentInput);

    try {
      const docContentQuery = documentContent.length > 0? "\n Here is a document for context: " + documentContent + " " : "";
      const fullConversation = conversation.concat([
        {
          role: "user",
          content: urlContentUserInput + docContentQuery,  
        },
      ]);
      setConversation(fullConversation);
      setUserInputs(userInputs.concat([currentInput]));
      setCurrentInput("");
      setNum(num - 1);

      let total_conv = "";
      for (const conv of fullConversation) {
        total_conv += conv.content + " ";
      }

      const tokenizer = new GPT4Tokenizer({ type: 'gpt3' });
      const estimatedTokenCount = tokenizer.estimateTokenCount(total_conv);

      if (estimatedTokenCount >= 16384) {
        createAlert('The input exceeds the token limit, maximum of 16384 tokens in each input, current input contains ' + estimatedTokenCount + ' tokens');
        setLoading(false);
        return;
      }

      let response;
      let search_terms_res;
      
      
      
      // // TO DO: rework the logic below, setState hook doesn't execute immediately, so checking length of conversation is unstable
      // if (conversation.length === 0) {
      //   console.log(conversation)
      //   response = await postConversationMult(fullConversation);
      // } else {
      //   response = await postConversation(
      //     fullConversation,
      //     includedDocuments
      //   );
      // };

      if (includedDocuments.length === 0) {
        // uses conversation prompt to generate search terms
        search_terms_res = await postSearchTerms(fullConversation, includedDocuments, false);
      } else {
        // uses conversationMult prompt to generate search terms
        search_terms_res = await postSearchTerms(fullConversation, includedDocuments, true);
      }
      console.log("submit response:",search_terms_res);
      
      if (!search_terms_res.ok) {
        const errorData = await search_terms_res.json();
        setAlert(errorData.error);
        setLoading(false);
        return;
      }

      console.log("search_terms_res ok!");

      const { toSearch, searchPrompt, documentPrompt } = await search_terms_res.json();
      console.log("searchPrompt", searchPrompt);
      console.log("documentPrompt", documentPrompt);
      console.log("toSearch", toSearch);
      response = await postConversation(searchPrompt, documentPrompt, fullConversation);

      console.log("response.status: " + response.status);
      console.log("response.body: " + response.body);
      console.log("response.body.constructor: " + response.body?.constructor);

      let buffer = "";
      setGenerating(true); // set generating to true to start the stream
      
      if (response.status === 200 && response.body != null && response.body.constructor === ReadableStream) {
            console.log("stream");
            const reader = response.body.getReader();
            const encode = new TextDecoder("utf-8");
                
                // read the response content by iteration
                while (generatingRef.current) {
                  
                  const currentResponse = await reader.read();
                  
                  if (currentResponse.done || !generatingRef.current) {
                    break;
                  }
                  console.log("generating: " + generating)
  
                  // decode content
                  const valueOfCurrentResponse = "" + encode.decode(currentResponse.value);
                  const objectsInCurrentResponse = valueOfCurrentResponse.split("\n").filter(str => str !== "");;
                              
                  for (let i = 0; i < objectsInCurrentResponse.length; i++) {
                    
                    try {
                      let object = JSON.parse( objectsInCurrentResponse[i].substring(5) );											
                                  
                      if (object.hasOwnProperty('choices')) {
                        
                        let content = object.choices.at(-1).delta.content;
                        
                        if (content == undefined || content == null) {
                          continue;
                        }
                        
                        buffer += content;
                        // console.log(buffer);
                        setLatestResponse(buffer);
                      }
                    }
                    catch (e) {
                      continue;
                    }
                  }
                }
                try {
                  setGenerating(true);
                  await reader.cancel();
                } catch (e) {}
              }
      else if (response.status === 200 && response.body != null) {
        console.log("non-stream")
        setLatestResponse(await response.json());
      }

      const tempConv = fullConversation.concat([{ role: "assistant", content: buffer }]);

      

      // save conversation to db
      // console.log(fullConversation.length);
      if (fullConversation.length < 2) {
        const titleResPromise = await postConversationTitle(fullConversation, includedDocuments);
      
        if (!titleResPromise.ok) {
          const errorData = await titleResPromise.json();
          setAlert(errorData.error);
          setLoading(false);
          return;
        }

        const { title } = await titleResPromise.json();
        setConversationTitle(title);
        // save new conversation to db
        (await postConversationSave(tempConv, includedDocuments, title)).json().then((res) => {setConversationUid(res.uid)}).catch((err) => {console.log(err)});
      }
      else if (conversationUid) {
        await putConversationSave(conversationUid, tempConv, includedDocuments, conversationTitle);
      }

      setConversation(
        tempConv
      );

      setSearchTerm(toSearch);
    } catch (error) {
      console.error(error);
      setAlert("Chat length exceeds programming limitations. Please refresh the page to start a new session.");
    } finally {
      setLoading(false);
      // console.log(fullConversation.length);
      
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
      // replace empty string in the following call with title of the conversation
      (await postConversationSave(conversation, includedDocuments, "")).json().then((res) => {setConversationUid(res.uid)}).catch((err) => {console.log(err)});
      console.log(conversation.length);
      setAlert(
        `Conversation successfully saved in Firebase.`
      );
      // setTimeout(function() {
          
      //   window.location.reload();}, 
      //   1000);
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

  // useEffect(() => {
  //     setConversationTitles(['Initial Title']);
    
  //     setTimeout(() => {
  //         setConversationTitles(['Updated Title']);
  //         console.log("5 seconds update: " + conversationTitles)
  //     }, 5000);
  // }, []);

  // useEffect(() => {
  //   console.log("conversationTitles", conversationTitles);
  // }, [conversationTitles]);


  // // debug function to get the conversation uid
  // useEffect(() => {
  //   console.log("conversationUid", conversationUid);
  // }, [conversationUid]);

  const createAlert = (message: string, backgroundColor = "red") => {
      // Create a new div element for our alert
      const alertDiv = document.createElement('div');
      alertDiv.textContent = message;
      alertDiv.style.position = 'fixed';
      alertDiv.style.top = '40px';
      alertDiv.style.left = '50%';
      alertDiv.style.transform = 'translate(-50%, -50%)';
      alertDiv.style.backgroundColor = backgroundColor;
      alertDiv.style.color = 'white';
      alertDiv.style.padding = '1em';
      alertDiv.style.zIndex = '1000';
      alertDiv.style.opacity = '0.8';
      alertDiv.style.borderRadius = '10px';

      // Append the alert to the body
      document.body.appendChild(alertDiv);

      // Remove the alert after 5 seconds
      window.setTimeout(() => {
        document.body.removeChild(alertDiv);
      }, 5000);
  }

  const { openFilePicker } = useFilePicker({
    accept: ".pdf",
    // ArrayBuffer takes exactly as much space as the original file. DataURL, the default, would make it bigger.
    readAs: "ArrayBuffer",
    validators: [
      new FileAmountLimitValidator({ max: 1 }),
      new FileSizeValidator({ maxFileSize: 5 * 1024 * 1024 /* 5 megabytes */ }),
    ],
    onFilesRejected: ({ errors }) => {
      console.log(errors);
      setAlert("File is too big. We have a 5 Mb limit.");
    },
    onFilesSuccessfullySelected: async ({ plainFiles, filesContent }: any) => {
      // this callback is called when there were no validation errors
      console.log("onFilesSuccessfullySelected", plainFiles, filesContent);

    let estimatedTokenCount = -1;
    let pdfFileSize = -1;

    try {
      const pdfContent = await postPDF(plainFiles[0])

      pdfFileSize = plainFiles[0].size;

      if (pdfFileSize > 5 * 1024 * 1024) {
        throw new Error("PDF File uploaded too large");
      }

      const tokenizer = new GPT4Tokenizer({ type: 'gpt3' });
      estimatedTokenCount = tokenizer.estimateTokenCount(pdfContent.content);

      if (estimatedTokenCount > 16384) {
        throw new Error("PDF token limit exceeded");
      }

      console.log(estimatedTokenCount);
    
      // Log the string
      setDocumentContent(pdfContent.content);

      setIncludedDocuments([...includedDocuments, pdfContent.uid]);

      // console.log(pdfContent.content);

      // console.log(filesContent[0]);
      
      const newDoc = await uploadPdfDocument({"content": pdfContent.content, "name": plainFiles[0].name});
      setDocuments([...documents, newDoc]);
      setIncludedDocuments([...includedDocuments, newDoc.uid]);
      createAlert("PDF uploaded successfully!", "green");
    } catch (err: Error | any) {
      if (err.message === 'PDF File uploaded too large') {
        createAlert('The PDF file uploaded is too large, maximum of 5MB expected, your pdf is ' + pdfFileSize/(1024*1024) + ' bytes');
      } else if (err.message === 'PDF token limit exceeded' && estimatedTokenCount !== -1) {
        createAlert('The PDF file uploaded exceeds limit, maximum of 8192 token in each PDF uploaded, your pdf contains ' + estimatedTokenCount + ' tokens');
      }
    }
      
      
    },
  });

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

  // const chatActions = [
  //   {
  //     id: 1,
  //     icon: <RefreshIcon />,
  //     title: "Refresh Conversation",
  //   },
  //   {
  //     id: 2,
  //     icon: <AddIcon />,
  //     title: "New Conversation",
  //   },
  //   {
  //     id: 3,
  //     icon: <CloseIcon />,
  //     title: "Clear Conversation",
  //   }
  // ] as {
  //   id: number;
  //   icon: any;
  //   onClick?: MouseEventHandler<HTMLButtonElement>;
  //   title: string;
  // }[];

  return (
    // <ConversationContext.Provider value={{ conversationTitles, setConversationTitle }}>
    <div
      style={{
        width: '100%'
      }}
    >
      <div
        style={{
          width: '100%',
          display: "flex",
          justifyContent: "space-between"
        }}
      >
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
        {/* {!showStartupImage && (
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
        )} */}
        <div
          id="search-modal"
          style={{
            width: "50%",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center"
          }}
        >
          <ul style={{textDecoration: "none", textIndent: 0}}>
            <SearchModal wasSearched={wasSearched} setSearchTerm={setSearchTerm} />
            <PDFModal documents={documents} deleteDocument={deleteDocumentChat} documentContent={documentContent} setDocumentContent={setDocumentContent} includedDocuments={includedDocuments} setIncludedDocuments={setIncludedDocuments}/>
            <FormControl sx={{ minWidth: 270, maxWidth:270, marginTop: 3 }}>
              <InputLabel id="demo-simple-select-autowidth-label">Chat History [Experimental]</InputLabel>
              <Select
                labelId="demo-simple-select-autowidth-label"
                id="demo-simple-select-autowidth"
                value={conversationTitle}
                onChange={(e: SelectChangeEvent) => {
                  if (e.target.value === conversationTitle || e.target.value === "") {
                    return;
                  }
                  setNewConv(false);
                  setShowStartupImage(false);
                  setConversationTitle(e.target.value as string)
                }}
                autoWidth
                label="chatHistory"
              >
                <MenuItem value={conversationTitle}>
                  <em>{conversationTitle}</em>
                </MenuItem>
                {conversationTitles.map((title) => (
                  <MenuItem value={title.title}>{title.title}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </ul>
        </div>
      </div>
      {/* <div
        id="search-modal"
        style={{
          display: "flex",
          justifyContent: "flex-end",
          position: "absolute",
          right: "40px"
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
        <ul style={{textDecoration: "none", textIndent: 0}}>
          <SearchModal wasSearched={wasSearched} setSearchTerm={setSearchTerm} />
          <PDFModal documents={documents} deleteDocument={deleteDocumentChat} currentInput={currentInput} setCurrentInput={setCurrentInput} includedDocuments={includedDocuments} setIncludedDocuments={setIncludedDocuments}/>
        </ul>
        
        
      </div> */}
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
            height: "calc(100vh - 350px)",
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
                        {/* set the latest response to the response stream, and all other responses as string from responses array state */}
                        {/* <TextFormatter text= {i === responses.length - 1 ? latestResponse : responses[i].response} />   */}
                        <ReactMarkdown>
                          {i === responses.length - 1 && responses.length > 1 ? latestResponse : responses[i].response}
                        </ReactMarkdown>
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
                          {i === responses.length - 1 && generating &&
                          <Button onClick={() => {
                            setGenerating(false);
                          }}>Stop</Button>
                          }
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
              <div style={{ display: "flex", justifyContent: "space-between", width: "95%", margin: "auto" }}>
                <IconButton
                  title="Attach a PDF File"
                  key={5}
                  onClick={openFilePicker}
                >
                  <AttachFileIcon />
                </IconButton>

                <OutlinedInput
                    // fullWidth
                    style={{ width: "95%", display: "flex" }}
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
            </div>
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

                {/* <div>
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
                </div> */}
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
    // </ConversationContext.Provider>
  );
}
