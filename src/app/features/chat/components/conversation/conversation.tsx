import { Card } from "@/components/ui/card";
import { useGlobalContext } from "@/app/store/global-context";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { ThumbsUp, ThumbsDown, RefreshCcw } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import useFetchQuery from "@/app/features/chat/hooks/use-fetch-query";
import { usePdfSearch } from "@/app/features/chat/hooks/use-pdf-search";

type Message = {
  role: "user" | "assistant" | "optimized";
  content: string;
};

function LinkRenderer(props: any) {
  return (
    <a href={props.href} className="underline" target="_blank" rel="noreferrer">
      {props.children}
    </a>
  );
}

export function Conversation() {
  const { conversation, latestResponse, loading, scrollIntoViewRef } = useGlobalContext();
  const { fetchQuery } = useFetchQuery();
  const { pdfSearch } = usePdfSearch();
  const [thumbsDownIndex, setThumbsDownIndex] = useState<number | null>(null);
  
  // Create a processed version of the conversation that includes optimized prompts
  const [processedConversation, setProcessedConversation] = useState<Message[]>([]);
  
  // List of keywords to add to the query
  const keywords = ["recent"];

  // State to track thumbs up/down feedback for each assistant message
  const [feedback, setFeedback] = useState<{ [key: number]: "up" | "down" | null }>({});
  
  // State to control pop-up dialog (only for thumbs-down)
  const [showPopup, setShowPopup] = useState(false);
  
  // Reference to keep track of processed conversation
  const processedConversationRef = useRef<Message[]>([]);

  // Process the conversation to add optimized prompts
  useEffect(() => {
    // Create a new array to hold the processed conversation
    const newProcessedConversation: Message[] = [];
    let userMessageCount = 0;
    
    // Iterate through the existing conversation
    for (let i = 0; i < conversation.length; i++) {
      const msg = conversation[i];
      
      // Add the original message
      newProcessedConversation.push(msg);
      
      // If it's a user message, add an optimized version after it
      if (msg.role === "user") {
        userMessageCount++;
        
        // Check if this user message already has an optimized prompt following it
        const nextMsg = conversation[i + 1];
        if (!nextMsg || nextMsg.role !== "optimized") {
          // Add an optimized version (for now, just duplicate the message)
          newProcessedConversation.push({
            role: "optimized",
            content: msg.content // In a real implementation, you'd modify this
          });
        }
      }
    }
    
    // Compare with the previous processed conversation to avoid unnecessary updates
    if (JSON.stringify(newProcessedConversation) !== JSON.stringify(processedConversationRef.current)) {
      processedConversationRef.current = newProcessedConversation;
      setProcessedConversation(newProcessedConversation);
    }
  }, [conversation]);

  const handleFeedback = (messageIndex: number, type: "up" | "down") => {
    setFeedback((prev) => {
      const newFeedback = prev[messageIndex] === type ? null : type;
      if (newFeedback === "down") {
        setShowPopup(true);
        setThumbsDownIndex(messageIndex); // Store the index of the thumbs-down message
      }
      return { ...prev, [messageIndex]: newFeedback };
    });
  };

  const handleRegenerateWithKeyword = () => {
    if (thumbsDownIndex !== null) {
      const lastUserMessage = [...processedConversation]
        .slice(0, thumbsDownIndex)
        .reverse()
        .find((msg) => msg.role === "user")?.content;
  
      if (typeof lastUserMessage === "string" && lastUserMessage.trim() !== "") {
        const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)]; // Select a random keyword
        const modifiedQuery = `${lastUserMessage} ${randomKeyword}`; // Append the keyword to the query
        fetchQuery(modifiedQuery); // Regenerate the response with the modified query
      }
    }
    setShowPopup(false); // Close the popup
  };

  // Get the role display name
  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "user": return "You";
      case "assistant": return "OpenJustice";
      case "optimized": return "Optimized Prompt";
      default: return role;
    }
  };

  return (
    <div id="conversation" className={cn(`w-full bg-inherit hidden overflow-auto`, { "flex": processedConversation.length > 0 })}>
      <div className="pt-[33px] w-screen md:w-chat mx-auto flex flex-col gap-[3.25rem] items-end px-4">
        {processedConversation.map((convoObj: Message, i: number) => (
          <Card
            key={i}
            className={cn(
              `bg-inherit w-fit`,
              {
                "shadow-none border-0 self-start": convoObj.role === "assistant",
              },
              {
                "px-5 py-3 rounded-[15px]": convoObj.role === "user",
              },
              {
                "px-5 py-3 rounded-[15px] bg-gray-100 self-start": convoObj.role === "optimized",
              }
            )}
          >
            {/* Conversation Title */}
            <p className={cn(`mb-2 ${convoObj.role === "user" ? "text-right" : "text-left"}`)}>
              <b>{getRoleDisplayName(convoObj.role)}</b>
            </p>

            {/* Message Content */}
            {convoObj.content && (
              <>
                <ReactMarkdown className="flex flex-col items-start gap-[10px] llm-markdown" components={{ a: LinkRenderer }}>
                  {convoObj.content}
                </ReactMarkdown>

                {/* Feedback & Regenerate (Only for Assistant Responses) */}
                {convoObj.role === "assistant" && (
                  <TooltipProvider delayDuration={0}>
                    <div className="flex gap-2 mt-4">
                      {/* Thumbs Up */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            className="hover:bg-transparent bg-[transparent] transition-all"
                            type="button"
                            onClick={() => handleFeedback(i, "up")}
                            aria-label="Good response"
                          >
                            <ThumbsUp
                              className="w-4 h-4"
                              style={{
                                fill: feedback[i] === "up" ? "rgba(128, 128, 128, 0.5)" : "none",
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
                            onClick={() => handleFeedback(i, "down")}
                            aria-label="Bad response"
                          >
                            <ThumbsDown
                              className="w-4 h-4"
                              style={{
                                fill: feedback[i] === "down" ? "rgba(128, 128, 128, 0.5)" : "none",
                                stroke: "currentColor",
                              }}
                            />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Bad response</TooltipContent>
                      </Tooltip>

                      {/* Regenerate Response */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            className="hover:bg-transparent bg-[transparent] md:px-4 transition-all self-center"
                            type="button"
                            aria-label="Regenerate Response"
                            onClick={() => {
                              const currentIndex = processedConversation.findIndex((msg: Message) => msg === convoObj);
                              if (currentIndex > 0) {
                                const lastUserMessage = [...processedConversation]
                                  .slice(0, currentIndex) // Only consider messages before this one
                                  .reverse() // Start from the most recent
                                  .find((msg) => msg.role === "user")?.content;

                                if (typeof lastUserMessage === "string" && lastUserMessage.trim() !== "") {
                                  fetchQuery(lastUserMessage);
                                }
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

            {/* Latest Buffered LLM Content */}
            {convoObj.role === "assistant" && i === processedConversation.length - 1 && (
              <div className="relative flex-col gap-2 flex justify-between break-normal pb-[50px]">
                <ReactMarkdown className="flex flex-col items-start gap-[10px] llm-markdown" components={{ a: LinkRenderer }}>
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

        {/* Pop-up Dialog (Shown on Thumbs Down Click) */}
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
                  onClick={handleRegenerateWithKeyword}
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
