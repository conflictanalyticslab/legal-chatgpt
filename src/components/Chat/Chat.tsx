"use client";

import React, { useRef, useEffect, useState, use } from "react";
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
  CardHeader,
} from "@mui/material";
import { Button as ButtonCN } from "../ui/button";
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormHelperText from '@mui/material/FormHelperText';
import { SelectChangeEvent } from '@mui/material/Select';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { Send, ThumbUp, ThumbDown, ContactSupportOutlined } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import { Typography } from "@mui/material";
import GPT4Tokenizer from 'gpt4-tokenizer';
import ReactMarkdown from 'react-markdown'

// import external hooks
import { auth } from "@/firebase";

// import images
import ChatPageOJ from "@/images/ChatPageOJ.png";
import { getAuthenticatedUser } from "@/util/requests/getAuthenticatedUser";
import { postConversation } from "@/util/requests/postConversation";
import { postSearchTerms} from "@/util/requests/postSearchTerms";
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
import {deleteDocument} from "@/util/api/deleteDocument";
import { set } from "firebase/database";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { Card, CardContent, CardTitle } from "../ui/card";
import { similaritySearch } from "./actions/semantic-search";
import { useChatContext } from "./store/ChatContext";
import { useRag } from "./actions/rag";
import { Input } from "../ui/input";
import ChatOptions from "./ChatOptions"

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
  const [endSession, setEndSession] = useState(false);
  const [num, setNum] = useState(-1);
  const [conversationTitles, setConversationTitles] = useState<{title: string, uid: string}[]>([]);
  const [conversationTitle, setConversationTitle] = useState<string>("");
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
          for (let i = 0; i < conversationData.conversation.length; i++) {
            if (conversationData.conversation[i].role === "user") {
              tempInputs.push(conversationData.conversation[i].content);
            } else if (conversationData.conversation[i].role === "assistant") {
              tempResponses.push({"response": conversationData.conversation[i].content, "is_satisfactory": "N/A", "feedback": {"message": "", "reasons": {"Superficial Response": false, "Lacks Citation": false, "Lacks Reasoning": false, "Lacks Relevant Facts": false}}});
            }
          }
          if (conversationData.conversation[conversationData.conversation.length-1].role === "user") {
            tempInputs.pop();
          }
          setUserInputs(tempInputs);
          setResponses(tempResponses);
          setLatestResponse(conversationData.conversation[conversationData.conversation.length-1].role === "assistant"? conversationData.conversation[conversationData.conversation.length-1].content : "");
        }
      } catch (e){
          console.log(e);
      }
    };
    fetchData();
    
  }, [conversationTitle]);

  useEffect(() => {
    // console.log("latestResponse changed, newConv: " + newConv +  ", latestResponse: " + latestResponse + ", responses: " + responses);
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
    else {
      setResponses([...responses, {
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
    }, [latestResponse]);

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

  /**
   * Extracts URLs from a given text
   * @param text string
   * @returns {string[]} list of url strings found in the query 
   */
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

  const handleBeforeUnload = (event: any) => {
    event.preventDefault();
    event.returnValue = "Are you sure you want to leave? The response will not be stored to your current chat's history if you exit right now.";
  }

  const { setLLMQuery, setRelevantPDFs, enableRag, setEnableRag, ragConversation, setRagConversation } = useChatContext();

  /**
   * Makes a query with OpenAi's LLM and implements RAG using Pinecone vector store
   * @param query the query from the user
   */
  const fetchWithRag = async (query:string) => {
    // Update the chat with the user's query first
    let newConvo = [...ragConversation, {
      role: "user",
      content: query,  
    }]
    setRagConversation(newConvo)

    // ---------------------------------------------- Generate RAG RESPONSE ---------------------------------------------- //
    // Update the conversation with RAG
    try {
      const res = await useRag(query);

      // Updated conversation with RAG response
      newConvo = [
        ...newConvo,
        {
          role: "agent",
          content: res,
        },
      ];

      // Saving a new a new conversation
      if (ragConversation.length < 2) {
        try {
          //Generates relevant conversation title
          const titleResPromise = await postConversationTitle(
            newConvo,
            includedDocuments
          );

          if (!titleResPromise.ok) {
            console.error(
              "Failed to generate conversation title and save conversation."
            );
          } else {
            const { title } = await titleResPromise.json();
            setConversationTitle(title);

            (await postConversationSave(newConvo, includedDocuments, title))
              .json()
              .then((res) => {
                setConversationUid(res.uid);
              })
              .catch((err) => {
                console.error("Failed to save conversation in postConversationSave: ", err);
              });
          }
        } catch (e) {
          console.error("In postConversationSave: ", e);
        }
      } else if (conversationUid) {
        // Updating existing conversation
        try {
          // Save existing conversation to db
          await putConversationSave(
            conversationUid,
            newConvo,
            includedDocuments,
            conversationTitle
          );
        } catch (e) {
          console.error("In putConversationSave: ", e);
        }
      }

      setRagConversation(newConvo);
    } catch (e) {
      console.error("Error in useRag: ", e);
      setRagConversation([
        ...newConvo,
        {
          role: "agent",
          content: "Error: failed to generate response",
        },
      ]);
    } finally {
      setLoading(false);
    }

    // ---------------------------------------------- SEMANTIC SEARCH ---------------------------------------------- //
    setLLMQuery(query);
    try {
      const pdfs = await similaritySearch(query)
      setRelevantPDFs(pdfs.matches);
    } catch(e) {
      console.error("In similaritySearch", e);
    }
  }

  const handleEnableRag = (value:boolean) => {
    setEnableRag(value);
    localStorage.setItem('enableRag', JSON.stringify(value));
  }

  useEffect(()=> {
    const enableRagStatus = localStorage.getItem('enableRag');
    if(enableRagStatus)
      setEnableRag(JSON.parse(enableRagStatus))
  }, [])

  /**
   * Submits the user's query
   * 
   * @returns 
   */
  const handleSubmit = async () => {

    // Check for authentication
    if (!auth.currentUser) {
      setAlert("Missing auth.currentUser");
      return;
    }

    setLoading(true);
    const userQuery = currentInput;
    setCurrentInput("");

    if(enableRag)
    {
      fetchWithRag(userQuery);
      return;
    }
  
    window.addEventListener('beforeunload', handleBeforeUnload);

    let urls = getUrls(userQuery);

    // Parses any urls in the string and validates them
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
    let urlContentUserInput = userQuery;

    // Fetching website content and replacing the url in the query with the website content.
    for (const url of urls) {
      try {
        urlContent = await postWebUrl(url);
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

    window.addEventListener("beforeunload", handleBeforeUnload);
    try {
      // Retrieves uploaded document content from user
      const docContentQuery =
        documentContent.length > 0
          ? "\n Here is a document for context: " + documentContent + " "
          : "";

      // Formats the conversation with the attached pdf document text
      const fullConversation = conversation.concat([
        {
          role: "user",
          content: urlContentUserInput + docContentQuery,
        },
      ]);

      setConversation(fullConversation);
      setUserInputs(userInputs.concat([userQuery]));
      setCurrentInput("");
      setNum(num - 1);

      let total_conv = "";
      for (const conv of fullConversation) {
        total_conv += conv.content + " ";
      }

      const tokenizer = new GPT4Tokenizer({ type: "gpt3" });
      const estimatedTokenCount = tokenizer.estimateTokenCount(total_conv);

      // Current limit for tokens we can input
      if (estimatedTokenCount >= 16384) {
        createAlert(
          "The input exceeds the token limit, maximum of 16384 tokens in each input, current input contains " +
            estimatedTokenCount +
            " tokens"
        );
        setLoading(false);
        return;
      }

      let response;
      let search_terms_res;

      if (includedDocuments.length === 0) {
        // uses conversation prompt to generate search terms
        search_terms_res = await postSearchTerms(
          fullConversation,
          includedDocuments,
          false
        );
      } else {
        // uses conversationMult prompt to generate search terms
        search_terms_res = await postSearchTerms(
          fullConversation,
          includedDocuments,
          true
        );
      }

      if (!search_terms_res.ok) {
        const errorData = await search_terms_res.json();
        setAlert(errorData.error);
        setLoading(false);
        return;
      }

      // ---------------------------------------------- SEMANTIC SEARCH ---------------------------------------------- //
      setLLMQuery(userQuery);
      const pdfs = await similaritySearch(userQuery);
      setRelevantPDFs(pdfs.matches);

      // ---------------------------------------------- LLM OUTPUT ---------------------------------------------- //
      const { toSearch, searchPrompt, documentPrompt } = await search_terms_res.json();

      response = await postConversation(
        searchPrompt,
        documentPrompt,
        fullConversation
      ); //Gets the model's output

      let buffer = "";
      setGenerating(true); // set generating to true to start the stream

      // The output stream coming from the model
      if (
        response.status === 200 &&
        response.body != null &&
        response.body.constructor === ReadableStream
      ) {
        const reader = response.body.getReader();
        const encode = new TextDecoder("utf-8");

        // read the response content by iteration
        while (generatingRef.current) {
          const currentResponse = await reader.read();

          if (currentResponse.done || !generatingRef.current) {
            break;
          }

          // decode content
          const valueOfCurrentResponse =
            "" + encode.decode(currentResponse.value);
          const objectsInCurrentResponse = valueOfCurrentResponse
            .split("\n")
            .filter((str) => str !== "");

          for (let i = 0; i < objectsInCurrentResponse.length; i++) {
            try {
              let object = JSON.parse(objectsInCurrentResponse[i].substring(5));

              if (object.hasOwnProperty("choices")) {
                let content = object.choices.at(-1).delta.content;

                if (content == undefined || content == null) {
                  continue;
                }

                buffer += content;
                setLatestResponse(buffer);
              }
            } catch (e) {
              continue;
            }
          }
        }
        try {
          setGenerating(true);
          await reader.cancel();
        } catch (e) {}
      } 
      // If the response is not a readable stream just jsonify it
      else if (response.status === 200 && response.body != null) {
        setLatestResponse(await response.json());
      }

      const tempConv = fullConversation.concat([
        { role: "assistant", content: buffer },
      ]);

      // Checks to see if this is a new conversation to determine if we need to add a new title or update an existing one.
      if (fullConversation.length < 2) {
        //Generates relevant conversation title
        const titleResPromise = await postConversationTitle(
          fullConversation,
          includedDocuments
        );

        if (!titleResPromise.ok) {
          const errorData = await titleResPromise.json();
          setAlert(errorData.error);
          setLoading(false);
          return;
        }

        const { title } = await titleResPromise.json();
        setConversationTitle(title);
        window.removeEventListener("beforeunload", handleBeforeUnload);

        // save new conversation to db
        (await postConversationSave(tempConv, includedDocuments, title))
          .json()
          .then((res) => {
            setConversationUid(res.uid);
          })
          .catch((err) => {
            console.log(err);
          });
      } else if (conversationUid) {
        // Save existing conversation to db
        await putConversationSave(
          conversationUid,
          tempConv,
          includedDocuments,
          conversationTitle
        );
      }

      setConversation(tempConv);

      setSearchTerm(toSearch);
    } catch (error) {
      console.error(error);
      setAlert("Chat length exceeds programming limitations. Please refresh the page to start a new session.");
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

  // const handleSave = async () => {
  //   setSaving(true);
  //   try {
  //     // TO DO: Move saving logic to an API route
  //     //console.log(userInputs, responses);
  //     // const docRef = await addDoc(collection(db, "conversations"), {
  //     //   userInputs: userInputs,
  //     //   responses: responses,
  //     // });
  //     // const userDocRef = await updateDoc(
  //     //   doc(db, "users", auth.currentUser.uid),
  //     //   { conversations: arrayUnion(docRef.id) }
  //     // );
  //     // setAlert(
  //     //     `Conversation (ID: ${docRef.id}) successfully saved in Firebase.`
  //     // );
  //     // replace empty string in the following call with title of the conversation
  //     (await postConversationSave(conversation, includedDocuments, "")).json().then((res) => {setConversationUid(res.uid)}).catch((err) => {console.log(err)});
  //     console.log(conversation.length);
  //     setAlert(
  //       `Conversation successfully saved in Firebase.`
  //     );
  //     // setTimeout(function() {
          
  //     //   window.location.reload();}, 
  //     //   1000);
  //   } catch (e) {
  //     setAlert(`Error saving conversation: ${e}`);
  //   }
  //   setSaving(false);
  // };

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

      // Log the string
      setDocumentContent(pdfContent.content);

      setIncludedDocuments([...includedDocuments, pdfContent.uid]);

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

  return (
    <div className="flex justify-center relative w-full overflow-auto max-h-[100vh] min-h-[100vh] items-start">
      <ChatOptions
        documents={documents}
        deleteDocumentChat={deleteDocumentChat}
        documentContent={documentContent}
        setDocumentContent={setDocumentContent}
        includedDocuments={includedDocuments}
        setIncludedDocuments={setIncludedDocuments}
        enableRag={enableRag}
        handleEnableRag={handleEnableRag}
        conversationTitles={conversationTitles}
        setShowStartupImage={setShowStartupImage}
        setNewConv={setNewConv}
        setConversationTitle={setConversationTitle}
        conversationTitle={conversationTitle}
      />

      {/* Main Content */}
      <div className="w-[55%] max-w-[1400px] h-[100%] flex flex-col justify-between py-[60px] relative">
        {/* Open Justice Background Information */}
        {showStartupImage && (
          <div className="relative">
            <div className="flex flex-col gap-[20px] items-center max-w-[708px] mx-[auto]">
              <Image
                src={ChatPageOJ}
                alt="Open Justice Powered by the Conflict Analytics Lab"
                width={350}
                height={200}
              />

              {[
                "AI, or Artificial Intelligence, refers to the simulation of human intelligence in machines that are programmed to perform tasks that normally require human intelligence, such as speech recognition, decision-making, and natural language processing.",
                "OpenJustice can help you with a wide variety of tasks, including answering legal questions, providing information on your case, and more. To use OpenJustice, simply type your question or prompt in the chat box and it will generate a response for you.",
              ].map((text, i) => (
                <Card className="bg-[transparent] rounded-[15px] text-[#686868]">
                  <CardHeader>
                    <CardTitle>What is AI?</CardTitle>
                  </CardHeader>
                  <CardContent className="flex items-center gap-[20px]">
                    <Image
                      src={`/assets/icons/${i == 0 ? "ai" : "cal-logo"}.svg`}
                      width={30}
                      height={30}
                      alt="ai"
                    />
                    <p style={{ textAlign: "justify", marginTop: "0px" }}>
                      AI, or Artificial Intelligence, refers to the simulation
                      of human intelligence in machines that are programmed to
                      perform tasks that normally require human intelligence,
                      such as speech recognition, decision-making, and natural
                      language processing.
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Normal Conversation */}
        {!enableRag && userInputs && (
          <div className="bg-[transparent] w-full pb-[100px]">
            {userInputs.map((input, i) => (
              <div key={input}>
                {/* Conversation Seperator Line */}
                {i !== 0 && <Divider></Divider>}

                {/* User's Input */}
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

                {/* Displays LLM Responses if there are any */}
                {i < responses.length && (
                  <>
                    <Divider></Divider>
                    <div
                      className="relative flex-col gap-2"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "start",
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

                        {/* LLM Model Response */}
                        <ReactMarkdown>
                          {i === responses.length - 1 &&
                          responses.length > 1 &&
                          newConv
                            ? latestResponse
                            : responses[i].response}
                        </ReactMarkdown>
                      </div>

                      {responses[i].is_satisfactory === "N/A" ? (
                        <ButtonGroup className="translate-x-0 translate-y-0 self-end">
                          {/* Thumbs Up */}
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

                          {/* Thumbs Down */}
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

                          {/* Stop Text Generation */}
                          {i === responses.length - 1 && generating && (
                            <Button onClick={() => setGenerating(false)}>
                              Stop
                            </Button>
                          )}
                        </ButtonGroup>
                      ) : (
                        <IconButton
                          disabled
                          className="translate-x-0 translate-y-0 self-end"
                        >
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

            {/* Loading Animation */}
            {loading && <CircularProgress></CircularProgress>}
          </div>
        )}

        {/* RAG Conversation */}
        {enableRag && (
          <>
            <div className="mb-[160px] bg-[transparent] flex flex-col gap-5 h-full w-full">
              {ragConversation &&
                ragConversation.length > 0 &&
                ragConversation.map((conversation: any, i: number) => (
                  <>
                    {i !== 0 && <hr />}
                    <div className="flex flex-col gap-2">
                      <Label className="font-bold">
                        {conversation?.role === "user"? "You" : "OpenJustice"}
                      </Label>
                      <p>{conversation.content}</p>
                    </div>
                  </>
                ))}
              {loading && (
                <div className="w-[10px] h-[10px] bg-[black] rounded-[50%] animate-pulse "></div>
              )}
            </div>
          </>
        )}

        {/* Prompt Input Text Field */}
        <div className="shadow-none bg-[#f5f5f7] fixed w-full h-[100px] bottom-0">
          <div className="relative w-[52.5%]">
          <ButtonCN
              variant="ghost"
              className="hover:bg-[#E2E8F0] bg-[transparent] h-[56px] absolute left-[-70px]"
              type="button"
              aria-label="Attach PDF"
              onClick={openFilePicker}
            >
              <AttachFileIcon />
            </ButtonCN>

          <Input
            className="w-full flex bg-[#f5f5f7] min-h-[56px] pr-[95px]"
            required
            placeholder="Prompt"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleSubmit();
                handleKeyDownImage();
                e.preventDefault();
              }
            }}
          />
          <ButtonCN
              className="absolute right-0 top-[50%] translate-y-[-50%]"
              variant={"ghost"}
            >
              <LoadingButton onClick={textBoxSubmission} loading={loading}>
                <Send></Send>
              </LoadingButton>
            </ButtonCN>
            <label className="text-[grey] text-[1rem] absolute bottom-[-30px] italic">
              {num === 0
                ? "No more prompts allowed. Please enter your final feedback."
                : `Prompts left: ${num}`}
            </label>
          </div>
        </div>

        {/* Alert Modal */}
        <Dialog open={!!alert} onClose={handleAlertClose}>
          <DialogContent>
            <DialogContentText>{alert}</DialogContentText>
          </DialogContent>
        </Dialog>

        {/* Feedback Modal */}
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
