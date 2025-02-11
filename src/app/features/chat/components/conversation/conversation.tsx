import { Card } from "@/components/ui/card";
import { useGlobalContext } from "@/app/store/global-context";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"; 
import useFetchQuery from "@/app/features/chat/hooks/use-fetch-query";

function LinkRenderer(props: any) {
  return (
    <a href={props.href} className="underline" target="_blank" rel="noreferrer">
      {props.children}
    </a>
  );
}

export function Conversation() {
  const { conversation, latestResponse, loading, scrollIntoViewRef } =
    useGlobalContext();
  const [showPopup, setShowPopup] = useState(false);
  const { fetchQuery } = useFetchQuery();
  const [feedback, setFeedback] = useState<{ [key: number]: "up" | "down" | null }>({});

   // State to track clicked buttons
   const [thumbsUpClicked, setThumbsUpClicked] = useState(false);
   const [thumbsDownClicked, setThumbsDownClicked] = useState(false);
  return (
    <div
      id="conversation"
      className={cn(
        `w-full bg-inherit hidden overflow-auto`,
        { "flex": conversation }
      )}
    >

      <div className="pt-[33px] w-screen md:w-chat mx-auto flex flex-col gap-[3.25rem] items-end px-4">
        {conversation && conversation.map((convoObj: any, i: number) => (
          <Card
            key={i}
            className={cn(
              `bg-inherit w-fit`,
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
              className={cn(`mb-2 ${i % 2 == 0 ? "text-right" : "text-left"}`)}
            >
              <b>{convoObj?.role === "user" ? "You" : "OpenJustice"}</b>
            </p>

            {/* Final Buffered Content */}
            {convoObj.content !== "" && (
                <>
                  <ReactMarkdown 
                    className="flex flex-col items-start gap-[10px] llm-markdown"
                    components={{ a: LinkRenderer }}
                  >
                    {convoObj?.content}
                  </ReactMarkdown>

                 {/* Feedback Buttons (Only for Assistant Responses) */}
                  {convoObj.role === "assistant" && (
                    <TooltipProvider delayDuration={0}>
                      <div className="flex gap-0.5 mt-4">
                        {/* Thumbs Up */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              className="hover:bg-transparent bg-[transparent] transition-all"
                            type="button"
                            aria-label="Good response"
                            onClick={() => {
                              setThumbsUpClicked(!thumbsUpClicked);
                              setThumbsDownClicked(false); // Reset thumbs-down if clicked
                            }}
                            >
                              <ThumbsUp
                              className="w-4 h-4"
                              style={{
                                fill: thumbsUpClicked ? "rgba(128, 128, 128, 0.5)" : "none",
                                stroke: "currentColor",
                              }}
                            />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Good response</TooltipContent>
                        </Tooltip>

                        {/* Thumbs Down */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              className="hover:bg-transparent bg-[transparent] transition-all"
                            type="button"
                            onClick={() => {
                              if (!thumbsDownClicked) {
                                setShowPopup(true); // popup if thumb is not pressed
                              }
                              setThumbsDownClicked(!thumbsDownClicked);
                              setThumbsUpClicked(false); // reset
                            }}
                              aria-label="Bad response"
                            >
                              <ThumbsDown
                              className="w-4 h-4"
                              style={{
                                fill: thumbsDownClicked ? "rgba(128, 128, 128, 0.5)" : "none",
                                stroke: "currentColor",
                              }}
                            />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Bad response</TooltipContent>
                        </Tooltip>

                        {/* Regenerate Response Button */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              className="hover:bg-transparent bg-[transparent] md:px-4 transition-all self-center"
                              type="button"
                              aria-label="Regenerate Response"
                              // for regenerating the response using the last response
                             // onClick={() => fetchQuery(conversation[conversation.length - 1]?.content)}
                             // for regenerating the response using the last user message
                             onClick={() => {
                              const lastUserMessage = conversation
                                .slice()
                                .reverse()
                                .find((msg: { role: string; content: string }) => msg.role === "user")
                                ?.content;
                          
                              if (typeof lastUserMessage === "string" && lastUserMessage.trim() !== "") {
                                fetchQuery(lastUserMessage);
                              }
                            }}
                            >
                              <RefreshCcw className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Regenerate response</TooltipContent>
                        </Tooltip>
                      </div>
                    </TooltipProvider>
                    
                    )}
                  </>
                  )}

            

            {/*  Buffered LLM Content */}
            {convoObj.role === "assistant" && i === conversation.length - 1 && (
              <div className="relative flex-col gap-2 flex justify-between break-normal pb-[50px]">
                <ReactMarkdown 
                  className="flex flex-col items-start gap-[10px] llm-markdown"
                  components={{ a: LinkRenderer }}
                >
                  {latestResponse}
                </ReactMarkdown>
                {/* Loading Animation Dot */}
                {loading && latestResponse === "" && (
                  <div className="w-[10px] h-[10px] bg-[black] rounded-[50%] animate-pulse self-start"></div>
                )}
              </div>
            )}
          </Card>
        ))}
        {/* Scroll Into View Ref */}
        <span ref={scrollIntoViewRef}></span>
        {/* Pop-up Dialog */}
        <Dialog open={showPopup} onOpenChange={setShowPopup}>
        <DialogContent className="sm:max-w-md">
        <div className="flex flex-col items-center space-y-4">
          <p className="text-gray-800">Would you like to regenerate an improved response?</p>
          
          <div className="flex items-center justify-center gap-4 w-full mt-6">
            <Button 
              variant="outline" 
              className="border border-gray-600 text-gray-600 bg-transparent hover:bg-gray-100 transition min-w-[80px]"
              onClick={() => setShowPopup(false)}
            >
              No
            </Button>
            <Button 
              variant="outline" 
              className="border border-gray-600 text-gray-600 bg-transparent hover:bg-gray-100 transition min-w-[80px]"
              onClick={() => setShowPopup(false)}
            >
              Yes
            </Button>
          </div>
        </div>
      </DialogContent>
        </Dialog>


      </div>
    </div>
  );
}