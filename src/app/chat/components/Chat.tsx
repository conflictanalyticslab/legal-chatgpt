"use client";

import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";

// import external components
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { useRouter } from "next/navigation";
import ReactMarkdown from 'react-markdown';
import { Button } from "../../../components/ui/button";

// import external hooks
import { auth } from "@/firebase";

// import images
import ChatPageOJ from "@/images/ChatPageOJ.png";
import { getAuthenticatedUser } from "@/util/requests/getAuthenticatedUser";

// import OJ hooks
import { getConversationTitles } from "@/util/requests/getConversationTitles";

// import OJ components
import { fetchWithRAG } from "@/app/chat/components/utils/LLM/rag_utils";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { getConversation } from "@/util/requests/getConversation";
import {
  getDocumentsOwnedByUser,
} from "@/util/requests/getDocumentsOwnedByUser";
import { Input } from "../../../components/ui/input";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner";
import { Toaster } from "../../../components/ui/toaster";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../../components/ui/tooltip";
import "./Chat.css";
import ChatOptions from "./chat_options/ChatOptions";
import { useChatContext } from "./store/ChatContext";
import { fetchWithLLM } from "./utils/LLM/normal_LLM_utils";
import { handleUploadFile } from "./utils/pdfs/pdf_utils";
export function Chat() {
  const router = useRouter();
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
    setInfoAlert,
    indexName,
    documents, 
    setDocuments,
    showStartupImage, 
    setShowStartupImage,
    includedDocuments,
    setIncludedDocuments,
    conversation,
    setConversation,
    latestResponse, 
    setLatestResponse,
    userQuery,
    setUserQuery,
    documentContent,
    setDocumentContent,
    num, 
    setNum,
    deleteDocumentChat,
    handleBeforeUnload
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
      fetchWithRAG();
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
          globalSearch,
          setInfoAlert
        );
      } catch (error) {
        console.error(error);
        setInfoAlert(
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
            {conversation.map((convoObj:any, i:number) => (
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
      </div>
      {/* Alert Modal */}
      <AlertDialog open={!!alert}>
        <AlertDialogTitle className="hidden"></AlertDialogTitle>
        <AlertDialogContent onOpenAutoFocus={(e: any) => e.preventDefault()}>
          <AlertDialogDescription className="text-md text-[black]">
            {alert}
          </AlertDialogDescription>
        </AlertDialogContent>
      </AlertDialog>

      {/* Info Alert Modal */}
      <Dialog open={!!infoAlert}>
        <DialogTitle className="hidden"></DialogTitle>
        <DialogContent onOpenAutoFocus={(e: any) => e.preventDefault()}>
          <DialogDescription className="text-md text-[black]">{infoAlert}</DialogDescription>
          <DialogFooter>
            <Button onClick={() => setInfoAlert("")}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
