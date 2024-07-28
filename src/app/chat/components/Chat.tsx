"use client";

import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";

// import external components
import { useRouter } from "next/navigation";
import { Button as Button } from "../../../components/ui/button";
import AttachFileIcon from '@mui/icons-material/AttachFile';
import ReactMarkdown from 'react-markdown'

// import external hooks
import { auth } from "@/firebase";

// import images
import ChatPageOJ from "@/images/ChatPageOJ.png";
import { getAuthenticatedUser } from "@/util/requests/getAuthenticatedUser";

// import OJ hooks
import { getConversationTitles } from "@/util/requests/getConversationTitles";

// import OJ components
import {
  UserDocument,
  getDocumentsOwnedByUser,
} from "@/util/requests/getDocumentsOwnedByUser";
import {deleteDocument} from "@/util/api/firebase_utils/deleteDocument";
import { useChatContext } from "./store/ChatContext";
import { useRag } from "../api/rag";
import { Input } from "../../../components/ui/input";
import ChatOptions from "./chat_options/ChatOptions"
import { Toaster } from "../../../components/ui/toaster";
import {fetchWithRAG} from "@/app/chat/components/utils/LLM/rag_utils"
import { Conversation } from "./types/conversationTitles";
import "./Chat.css"
import { cn } from "@/lib/utils";
import { fetchWithLLM } from "./utils/LLM/normal_LLM_utils";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "../../../components/ui/tooltip";
import { handleUploadFile } from "./utils/pdfs/pdf_utils";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner";
import { Card, CardContent } from "@/components/ui/card";
import { getConversation } from "@/util/requests/getConversation";
import { toast } from "@/components/ui/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { AlertDialogTitle } from "@radix-ui/react-alert-dialog";
export function Chat() {
  const router = useRouter();
  const [conversation, setConversation] = useState<Conversation[]>([]);
  const [latestResponse, setLatestResponse] = useState('');
  const [userQuery, setUserQuery] = useState('');
  const [documentContent, setDocumentContent] = useState('');
  const [num, setNum] = useState(-1);
  const [includedDocuments, setIncludedDocuments] = useState<string[]>([]);
  const [showStartupImage, setShowStartupImage] = useState(true);
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const scrollIntoViewRef = useRef<HTMLSpanElement>(null);
  const {
    setDocumentQuery,
    setRelevantDocs,
    enableRag,
    namespace,
    generateFlagRef,
    loadingPDF,
    setLoadingPDF,
    alert,
    setAlert,
    loading,
    setLoading,
    documentQueryMethod,
    setPdfLoading,
    setEnableRag,
    setDocumentQueryMethod,
    conversationTitles,
    setConversationTitles,
    conversationTitle,
    conversationUid,
    setConversationUid,
    setConversationTitle,
    globalSearch,
    setGlobalSearch,
    infoAlert,
    setInfoAlert
  } = useChatContext();

  /**
   * Scrolls the conversation downwards while the LLM is generating output
   */
  useEffect(()=> {
    if(scrollIntoViewRef?.current){
      scrollIntoViewRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [latestResponse, conversation])

  /**
   * Wrapper function to fetch selected previous conversation
   * 
   * @returns 
   */
  async function getSelectedConversation() {
    try {
      const selectedConversationContent = await getConversation(
        conversationTitle
      );
      if (!selectedConversationContent) return;

      // Update the chat conversation and the selected conversation Uid
      setConversation(selectedConversationContent?.conversation);
      setConversationUid(selectedConversationContent.conversationId) // Note the conversationUid is used to find
    }
    catch (error:any) {
      toast({
        title:
          "Failed to get conversation",
        variant: "destructive",
      });
    }
  }

  /**
   * Changes the conversation based on the selected conversation title
   */
  useEffect(()=>{
    getSelectedConversation();
  },[conversationTitle])

  /**
   * Authenticating User and getting user documents and setting conversation titles
   */
  useEffect(() => {
    setAlert("Authenticating user...");
    getAuthenticatedUser()
      .then((user) => {
        if (user) {
          setNum(user.prompts_left);
          setAlert('');
        }
      })
      .then(() => {
        // fetch documents from db and set state after authentication
        const fetchData = async () => {
          try {
            setDocuments((await getDocumentsOwnedByUser()) as any);
            setConversationTitles(await getConversationTitles());
          } catch (e) {
            console.log(e);
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
      .catch((err) => {
        console.log("Error when deleting PDF, " + err);
      });
  };

  /**
   * Stops generating the normal LLM buffered output
   * 
   * @param event 
   * @returns 
   */
  const stopQuery = (event:React.MouseEvent<HTMLButtonElement>) =>{
    if (enableRag) return;

    event.preventDefault();
    generateFlagRef.current = false;
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

  /**
   * Resets all of the previously selected options for the chatbox
   */
  useEffect(() => {
    const enableRagStatus = localStorage.getItem("enableRag");
    const documentQueryChoice = localStorage.getItem("documentQueryPrevChoice");
    const globalSearch = localStorage.getItem("globalSearch");
    if (enableRagStatus) setEnableRag(JSON.parse(enableRagStatus));
    if (documentQueryChoice) setDocumentQueryMethod(JSON.parse(documentQueryChoice));
    if (globalSearch) setGlobalSearch(JSON.parse(globalSearch));
  }, []);

  /**
   * Submits the user's query
   * To Do: make it so that handle submit only calls the LLM output so we don't have to wait until all the other proccess are complete before generating output
   *
   * @returns {void}
   */
  const handleSubmit = async (event: React.MouseEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (userQuery === "") return;

    // Check for authentication
    if (!auth.currentUser) {
      setAlert("Missing auth.currentUser");
      return;
    }

    setShowStartupImage(false);
    setLoading(true);
    setPdfLoading(true);
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
        includedDocuments,
        conversationTitle,
        setConversationTitle,
        setConversationUid,
        conversationUid,
        setLoading,
        setDocumentQuery,
        setRelevantDocs,
        setAlert,
        handleBeforeUnload,
        documentQueryMethod,
        setPdfLoading,
        setConversationTitles,
        globalSearch
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
          setDocumentQuery,
          setRelevantDocs,
          setPdfLoading,
          namespace,
          conversationTitle,
          setConversationTitle,
          conversationUid,
          setConversationUid,
          handleBeforeUnload,
          documentQueryMethod,
          setConversationTitles,
          globalSearch
        );
      } catch (error) {
        console.error(error);
        setAlert(
          "Chat length exceeds programming limitations. Please refresh the page to start a new session."
        );
      }
    }
  };

    const {openFilePicker}= handleUploadFile(
      setDocumentContent,
      setIncludedDocuments,
      setDocuments,
      documents,
      includedDocuments,
      setLoadingPDF,
      setAlert
    );

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
        conversationTitles={conversationTitles}
        setShowStartupImage={setShowStartupImage}
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
                  <CardContent className="flex items-center gap-[20px] p-6">
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
                <p
                  className={cn(
                    `mb-2 ${i % 2 == 0 ? "text-right" : "text-left"}`
                  )}
                >
                  <b>{convoObj?.role === "user" ? "You" : "OpenJustice"}</b>
                </p>

                {/* Final Buffered Content */}
                {convoObj.content !== "" && (
                  <ReactMarkdown className="flex flex-col items-start gap-[10px] llm-markdown">
                    {convoObj?.content}
                  </ReactMarkdown>
                )}

                {/*  Buffered LLM Content */}
                {convoObj.role === "assistant" &&
                  i === conversation.length - 1 && (
                    <div className="relative flex-col gap-2 flex justify-between break-normal">
                      <ReactMarkdown className="flex flex-col items-start gap-[10px] llm-markdown">
                        {latestResponse}
                      </ReactMarkdown>
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
        <form
          className="shadow-none bg-[#f5f5f7] fixed w-full h-[100px] bottom-0"
          onSubmit={handleSubmit}
        >
          <div className="relative w-[52.5%]">
            {enableRag ? (
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger className="bg-[transparent] p-3 absolute left-[-70px] opacity-[0.5] cursor-auto">
                    <AttachFileIcon />
                  </TooltipTrigger>
                  <TooltipContent>
                    Document Uploading isn't available when RAG is enabled.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <Button
                variant="ghost"
                className="hover:bg-[#E2E8F0] bg-[transparent] h-[56px] w-[56px] absolute left-[-70px]"
                type="button"
                aria-label="Attach PDF"
                onClick={openFilePicker}
                disabled={enableRag || loadingPDF}
              >
                {loadingPDF ? <LoadingSpinner /> : <AttachFileIcon />}
              </Button>
            )}
            <Input
              className="w-full flex bg-[#f5f5f7] min-h-[56px] pr-[60px] focus-visible:ring-[none]"
              placeholder="Ask OpenJustice"
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
            />
            {loading ? (
              <Button
                className="absolute right-0 top-[50%] translate-y-[-50%]"
                variant={"ghost"}
                onClick={stopQuery}
              >
                {enableRag ? (
                  <LoadingSpinner />
                ) : (
                  <Image
                    src="/assets/icons/pause.svg"
                    alt="pause"
                    width={20}
                    height={20}
                  />
                )}
              </Button>
            ) : (
              <Button
                className="absolute right-0 top-[50%] translate-y-[-50%]"
                variant={"ghost"}
                type="submit"
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
        </form>

        {/* Alert Modal */}
        <AlertDialog open={!!alert}>
          <AlertDialogTitle className="hidden"></AlertDialogTitle>
          <AlertDialogContent onOpenAutoFocus={(e: any) => e.preventDefault()}>
            <AlertDialogDescription className="text-center">{alert}</AlertDialogDescription>
          </AlertDialogContent>
        </AlertDialog>

        {/* Info Modal */}
        <AlertDialog open={!!infoAlert}>
          <AlertDialogTitle className="hidden"></AlertDialogTitle>

          <AlertDialogContent onOpenAutoFocus={(e: any) => e.preventDefault()}>
            <AlertDialogDescription className="text-center">{infoAlert}</AlertDialogDescription>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => setInfoAlert("")}>
                Close
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
