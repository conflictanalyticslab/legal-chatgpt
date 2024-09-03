"use client";

import Image from "next/image";
import React, { useEffect, useRef } from "react";
import { useChatContext } from "../../store/ChatContext";
import { useRouter } from "next/navigation";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Conversation } from "../Conversation/Conversation";
import { ConversationQuery } from "../ConversationQuery/ConversationQuery";

import { toast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";

import "./Chat.css";
import { Label } from "@/components/ui/label";
import { cn, errorResponse } from "@/utils/utils";
import useFetchQuery from "../../hooks/useFetchQuery";
import { getAuthenticatedUser } from "@/lib/requests/getAuthenticatedUser";
import { getDocumentsOwnedByUser } from "@/lib/requests/getDocumentsOwnedByUser";
import { getConversationTitles } from "@/lib/requests/getConversationTitles";
import { getConversation } from "@/lib/requests/getConversation";

export function Chat() {
  const router = useRouter();

  const {
    alert,
    setAlert,
    setDocumentQueryMethod,
    setConversationTitles,
    setConversationId,
    infoAlert,
    setInfoAlert,
    setDocuments,
    showStartupImage,
    conversation,
    setConversation,
    latestResponse,
    setNum,
    scrollIntoViewRef,
    conversationId,
  } = useChatContext();

  const { fetchQuery } = useFetchQuery();

  /**
   * Scrolls the conversation downwards while the LLM is generating output
   */
  useEffect(() => {
    if (scrollIntoViewRef?.current) {
      scrollIntoViewRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [latestResponse, conversation]);

  /**
   * Wrapper function to fetch selected previous conversation
   *
   * @returns
   */
  async function getSelectedConversation() {
    try {
      const selectedConversationContent = await getConversation(conversationId);
      if (!selectedConversationContent) return;

      // Update the chat conversation and the selected conversation Uid
      setConversation(selectedConversationContent?.conversation);
      setConversationId(selectedConversationContent.conversationId); // Note the conversationId is used to find
    } catch (error: any) {
      toast({
        title: "Failed to get conversation",
        variant: "destructive",
      });
    }
  }

  /**
   *  Changes the conversation based on the selected conversation title
   */
  useEffect(() => {
    getSelectedConversation();
  }, [conversationId]);

  async function initalizeChat() {
    try {
      const user = await getAuthenticatedUser();
      if (user) {
        setNum(user.prompts_left);
        setAlert("");
      }
    } catch (error: unknown) {
      router.push("/login");
    }

    try {
      setDocuments(await getDocumentsOwnedByUser());
      setConversationTitles(await getConversationTitles());
    } catch (error: unknown) {
      setInfoAlert(errorResponse(error));
    }
  }

  /**
   * Authenticating User and getting user documents and setting conversation titles
   */
  useEffect(() => {
    setAlert("Authenticating user...");
    initalizeChat();

    return () => {
      setInfoAlert("");
    };
  }, []);

  const handleQueryPrompt = (prompt: string) => {
    fetchQuery(prompt);
  };

  /**
   * Resets all of the previously selected options for dataset options
   */
  useEffect(() => {
    // const documentQuerChoice = localStorage.getItem("documentQueryPrevChoice");
    // if (documentQueryChoice)
    //   setDocumentQueryMethod(JSON.parse(documentQueryChoice));
  }, []);

  return (
    <>
      <Toaster />
      <div className="flex justify-center relative w-full overflow-auto max-h-[100vh] min-h-[100vh] items-start">
        {/* Main Content */}
        <div
          className={cn(
            "w-full h-[100%] grid grid-rows-[1fr_auto] pt-[30px] relative"
          )}
        >
          {/* Open Justice Background Information */}
          {showStartupImage && (
            <div className="relative self-center w-chat mx-auto">
              <div className="flex flex-col gap-[10px] items-center max-w-[708px] mx-[auto]">
                <div className="p-3 flex flex-col gap-2">
                  <Image
                    src={"/assets/icons/logo.svg"}
                    alt="Open Justice Powered by the Conflict Analytics Lab"
                    width={400}
                    height={120}
                  />
                  <Label className="text-center text-md w-full text-[#838383]">
                    Ask any legal questions.
                  </Label>
                </div>
                <div className="flex gap-3 flex-wrap justify-center">
                  {[
                    "Data Privacy",
                    "Service Terms",
                    "GDPR Rules",
                    "Copyright Laws",
                  ].map((prompt, key) => (
                    <Button
                      key={key}
                      variant="outline"
                      className="bg-transparent flex rounded-[3rem] hover:bg-[#F1F1F1] cursor-pointer h-auto py-1 px-4 text-nowrap"
                      onClick={() => handleQueryPrompt(prompt)}
                    >
                      {prompt}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Conversation */}
          <Conversation />

          {/* Query Input Text Field */}
          <ConversationQuery />
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
            <DialogDescription className="text-md text-[black]">
              {infoAlert}
            </DialogDescription>
            <DialogFooter>
              <Button onClick={() => setInfoAlert("")}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
