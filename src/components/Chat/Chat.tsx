"use client";

import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";

// import external components
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogContentText,
  CardHeader,
} from "@mui/material";
import { Button as Button } from "../ui/button";
import AttachFileIcon from '@mui/icons-material/AttachFile';
import GPT4Tokenizer from 'gpt4-tokenizer';
import ReactMarkdown from 'react-markdown'

// import external hooks
import { auth } from "@/firebase";

// import images
import ChatPageOJ from "@/images/ChatPageOJ.png";
import { getAuthenticatedUser } from "@/util/requests/getAuthenticatedUser";
import { postConversation } from "@/util/requests/postConversation";
import { uploadPdfDocument } from "@/util/requests/uploadPdfDocument";
import { useFilePicker } from "use-file-picker";
import {
  FileAmountLimitValidator,
  FileSizeValidator,
} from "use-file-picker/validators";

// import OJ hooks
import { getConversationTitles } from "@/util/requests/getConversationTitles";
import { postPDF } from "@/util/requests/postPDF";

// import OJ components
import {
  UserDocument,
  getDocumentsOwnedByUser,
} from "@/util/requests/getDocumentsOwnedByUser";
import {deleteDocument} from "@/util/api/deleteDocument";
import { Card, CardContent, CardTitle } from "../ui/card";
import { similaritySearch } from "../../app/chat/actions/semantic-search";
import { useChatContext } from "./store/ChatContext";
import { useRag } from "../../app/chat/actions/rag";
import { Input } from "../ui/input";
import ChatOptions from "./ChatOptions"
import { toast } from "../ui/use-toast";
import { Toaster } from "../ui/toaster";
import {fetchWithRAG} from "@/components/Chat/utils/rag_utils"
import { Conversation } from "./types/conversationTitles";
import "./Chat.css"
import { cn } from "@/lib/utils";
import { fetchWithLLM } from "./utils/normal_LLM_utils";

export function Chat({
  wasSearched,
  setSearchTerm,
}: {
  wasSearched: boolean;
  setSearchTerm: (searchTerm: string) => void;
}) {
  const router = useRouter();
  const [conversation, setConversation] = useState<Conversation[]>([]);
  const [latestResponse, setLatestResponse] = useState('');
  const [userQuery, setUserQuery] = useState('');
  const [documentContent, setDocumentContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [num, setNum] = useState(-1);
  const [conversationTitles, setConversationTitles] = useState<
    { title: string; uid: string }[]
  >([]);
  const [conversationTitle, setConversationTitle] = useState<string>('');
  const [includedDocuments, setIncludedDocuments] = useState<string[]>([]);
  const [conversationUid, setConversationUid] = useState<string | null>('');
  const [showStartupImage, setShowStartupImage] = useState(true);
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const scrollIntoViewRef = useRef<HTMLSpanElement>(null);
  const {
    setPdfQuery,
    setRelevantPDFs,
    enableRag,
    setEnableRag,
    namespace,
    generateFlagRef,
  } = useChatContext();
  const [alert, setAlert] = useState('');

  useEffect(()=> {
    if(scrollIntoViewRef?.current){
      scrollIntoViewRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [latestResponse, conversation])

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
  }, []);

  // handle delete documents from PDFModal
  const deleteDocumentChat = (uid: string) => {
    deleteDocument(uid)
      .then(() => setDocuments(documents.filter((doc) => doc.uid !== uid)))
      .then(() => {
        console.log("PDF deleted successfully");
      })
      .catch((err) => {
        console.log("Error when deleting PDF, " + err);
      });
  };

  const stopQuery = () =>{
    generateFlagRef.current = false
  }

  /**
   * Confirms with the user if they want to exit the tab
   * 
   * @param event the close tab event
   */
  const handleBeforeUnload = (event: any) => {
    event.preventDefault();
    event.returnValue =
      "Are you sure you want to leave? The response will not be stored to your current chat's history if you exit right now.";
  };

  const handleEnableRag = (value: boolean) => {
    setEnableRag(value);
    localStorage.setItem("enableRag", JSON.stringify(value));
  };

  useEffect(() => {
    const enableRagStatus = localStorage.getItem("enableRag");
    if (enableRagStatus) setEnableRag(JSON.parse(enableRagStatus));
  }, []);

  /**
   * Submits the user's query
   * To Do: make it so that handle submit only calls the LLM output so we don't have to wait until all the other proccess are complete before generating output
   *
   * @returns {void}
   */
  const handleSubmit = async () => {
    if (userQuery === "") return;

    // Check for authentication
    if (!auth.currentUser) {
      setAlert("Missing auth.currentUser");
      return;
    }

    setShowStartupImage(false);
    setLoading(true);
    setUserQuery("");
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Call RAG
    if (enableRag) {
      fetchWithRAG(
        userQuery,
        conversation,
        setConversation,
        useRag,
        namespace,
        postConversation,
        includedDocuments,
        setConversationUid,
        conversationUid,
        setLoading,
        conversationTitle,
        setPdfQuery,
        setRelevantPDFs,
        similaritySearch,
        setAlert,
        handleBeforeUnload
      );
    } else {
      try {
        fetchWithLLM(
          documentContent,
          userQuery,
          conversation,
          setConversation,
          setUserQuery,
          num,
          setNum,
          setLoading,
          includedDocuments,
          setAlert,
          generateFlagRef,
          setLatestResponse,
          setPdfQuery,
          setRelevantPDFs,
          setSearchTerm,
          namespace,
          conversationTitle,
          setConversationTitle,
          conversationUid,
          setConversationUid,
          handleBeforeUnload
        );
      } catch (error) {
        console.error(error);
        setAlert(
          "Chat length exceeds programming limitations. Please refresh the page to start a new session."
        );
      }
    }
  };

  const handleAlertClose = () => {
    setAlert("");
  };

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
    onFilesSuccessfullySelected: async ({ plainFiles }: any) => {
      // this callback is called when there were no validation errors
      let estimatedTokenCount = -1;
      let pdfFileSize = -1;

      try {
        const pdfContent = await postPDF(plainFiles[0]);

        pdfFileSize = plainFiles[0].size;

        if (pdfFileSize > 5 * 1024 * 1024) {
          throw new Error("PDF File uploaded too large");
        }

        const tokenizer = new GPT4Tokenizer({ type: "gpt3" });
        estimatedTokenCount = tokenizer.estimateTokenCount(pdfContent.content);

        if (estimatedTokenCount > 16384) {
          throw new Error("PDF token limit exceeded");
        }

        // Log the string
        setDocumentContent(pdfContent.content);
        setIncludedDocuments([...includedDocuments, pdfContent.uid]);

        const newDoc = await uploadPdfDocument({
          content: pdfContent.content,
          name: plainFiles[0].name,
        });
        setDocuments([...documents, newDoc]);
        setIncludedDocuments([...includedDocuments, newDoc.uid]);

        toast({
          title: "PDF uploaded successfully!",
        });
      } catch (err: Error | any) {
        if (err.message === "PDF File uploaded too large") {
          toast({
            title:
              "The PDF file uploaded is too large, maximum of 5MB expected, your pdf is ' + pdfFileSize/(1024*1024) + ' bytes!",
            variant: "destructive",
          });
        } else if (
          err.message === "PDF token limit exceeded" &&
          estimatedTokenCount !== -1
        ) {
          toast({
            title:
              "The PDF file uploaded exceeds limit, maximum of 8192 token in each PDF uploaded, your pdf contains ' + estimatedTokenCount + ' tokens",
            variant: "destructive",
          });
        }
      }
    },
  });

  return (
    <div className="flex justify-center relative w-full overflow-auto max-h-[100vh] min-h-[100vh] items-start">
      <Toaster />
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
                <Card
                  key={i}
                  className="bg-[transparent] rounded-[15px] text-[#686868]"
                >
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
                      {text}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Normal Conversation */}
        {conversation && (
          <div
            id="conversation"
            className={cn(
              `bg-[transparent] w-full pb-[150px] flex flex-col gap-5 bg-inherit items-end`
            )}
          >
            {conversation.map((convoObj, i) => (
              <Card
                key={i}
                className={cn(
                  `bg-inherit max-w w-fit px-3`,
                  {
                    "shadow-none border-0 self-start":
                      convoObj.role === "assistant",
                  },
                  {
                    "px-5 py-3 rounded-[15px]": convoObj.role === "user",
                  }
                )}
              >
                {/* Conversation Title */}
                <p className={cn(`mb-2 ${i % 2 == 0 ? "text-right" : "text-left"}`)}>
                  <b>{convoObj?.role === "user" ? "You" : "OpenJustice"}</b>
                </p>

                {/* Final Buffered Content */}
                {convoObj.content !== "" && (
                  <ReactMarkdown>{convoObj?.content}</ReactMarkdown>
                )}

                {/*  Buffered LLM Content */}
                {convoObj.role === "assistant" &&
                  i === conversation.length - 1 && (
                    <div className="relative flex-col gap-2 flex justify-between break-normal">
                      <ReactMarkdown>{latestResponse}</ReactMarkdown>
                      {/* Loading Animation */}
                      {loading && latestResponse === "" && (
                        <div className="w-[10px] h-[10px] bg-[black] rounded-[50%] animate-pulse self-start"></div>
                      )}
                    </div>
                  )}
              </Card>
            ))}
            {/* Scroll Into View Ref */}
            <span ref={scrollIntoViewRef}></span>
          </div>
        )}

        {/* Query Input Text Field */}
        <div className="shadow-none bg-[#f5f5f7] fixed w-full h-[100px] bottom-0">
          <div className="relative w-[52.5%]">
            <Button
              variant="ghost"
              className="hover:bg-[#E2E8F0] bg-[transparent] h-[56px] absolute left-[-70px]"
              type="button"
              aria-label="Attach PDF"
              onClick={openFilePicker}
            >
              <AttachFileIcon />
            </Button>
            <Input
              className="w-full flex bg-[#f5f5f7] min-h-[56px] pr-[60px] focus-visible:ring-[none]"
              required
              placeholder="Ask OpenJustice"
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit();
              }}
            />
            {loading ? (
              <Button
                className="absolute right-0 top-[50%] translate-y-[-50%]"
                variant={"ghost"}
                onClick={stopQuery}
              >
                <Image
                  src="/assets/icons/pause.svg"
                  alt="pause"
                  width={20}
                  height={20}
                />
              </Button>
            ) : (
              <Button
                className="absolute right-0 top-[50%] translate-y-[-50%]"
                variant={"ghost"}
                onClick={handleSubmit}
              >
                <Image
                  src="/assets/icons/send-horizontal.svg"
                  alt="send"
                  width={20}
                  height={20}
                />
              </Button>
            )}
            <label className="text-[grey] text-sm absolute bottom-[-20px] italic ">
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
      </div>
    </div>
  );
}
