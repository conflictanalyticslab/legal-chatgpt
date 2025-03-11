import { Card } from "@/components/ui/card";
import { useGlobalContext } from "@/app/store/global-context";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { useState, useEffect } from "react";
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

// Function to render links in markdown content
function LinkRenderer(props: any) {
  return (
    <a href={props.href} className="underline" target="_blank" rel="noreferrer">
      {props.children}
    </a>
  );
}

export function Conversation() {
  const { conversation, latestResponse, loading, scrollIntoViewRef } = useGlobalContext();
  const [showPopup, setShowPopup] = useState(false);
  const { fetchQuery } = useFetchQuery();
  const [feedback, setFeedback] = useState<{ [key: number]: "up" | "down" | null }>({});
  
  // State to track clicked buttons
  const [thumbsUpClicked, setThumbsUpClicked] = useState(false);
  const [thumbsDownClicked, setThumbsDownClicked] = useState(false);

  // State to store both original and optimized prompts
  const [originalPrompt, setOriginalPrompt] = useState<string | null>(null);
  const [optimizedPrompt, setOptimizedPrompt] = useState<string | null>(null);

  useEffect(() => {
    // Fetch the optimized prompt when the latest assistant response is updated
    if (latestResponse) {
      fetchOptimizedPrompt(latestResponse);
    }
  }, [latestResponse]);

  // Function to fetch optimized prompt from the server
  const fetchOptimizedPrompt = async (response: string) => {
    try {
      const res = await fetch("/optimize-prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",  // Ensure the Content-Type is set to 'application/json'
        },
        body: JSON.stringify({ system_prompt: response }),  // Send the system_prompt in JSON format
      });

      const data = await res.json();  // Parse the response as JSON

      if (data.optimized_prompt) {
        setOriginalPrompt(response);  // Set original prompt
        setOptimizedPrompt(data.optimized_prompt);  // Set optimized prompt
      } else {
        console.error("Error:", data.error || "No optimized prompt received");
      }
    } catch (error) {
      console.error("Error fetching optimized prompt:", error);
    }
  };

  // Function to handle feedback (thumbs up/down)
  const handleFeedback = async (responseId: number, feedbackType: "up" | "down") => {
    try {
      // Set feedback state
      setFeedback((prev) => ({ ...prev, [responseId]: feedbackType }));

      // Call your backend to process the feedback (this would typically involve an API call)
      await fetch("/evaluate-prediction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prediction: latestResponse,  // The assistant's response
          ground_truth_answer: conversation[responseId]?.content,  // Ground truth (e.g., user input or correct answer)
        }),
      });
    } catch (error) {
      console.error("Error sending feedback:", error);
    }
  };

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

                  {/* Display the original and optimized prompts if assistant response */}
                  {convoObj.role === "assistant" && (
                    <div className="mt-4">
                      <p><b>Original Prompt:</b> {originalPrompt}</p>
                      <p><b>Optimized Prompt:</b> {optimizedPrompt}</p>
                    </div>
                  )}

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
                                handleFeedback(i, "up");  // Send feedback
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
                                handleFeedback(i, "down");  // Send feedback
                              }}
                              aria-label="Bad response"
                            >
                              <ThumbsDown
                                className="w-4 h-4"
                                style={{
                                  fill: thumbsDownClicked ? "rgba(128, 128, 0.5)" : "none",
                                  stroke: "currentColor",
                                }}
                              />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Bad response</TooltipContent>
                        </Tooltip>
                      </div>
                    </TooltipProvider>
                  )}
                </>
            )}
            
            {/* Loading animation and Buffered LLM Content */}
            {convoObj.role === "assistant" && i === conversation.length - 1 && (
              <div className="relative flex-col gap-2 flex justify-between break-normal pb-[50px]">
                <ReactMarkdown 
                  className="flex flex-col items-start gap-[10px] llm-markdown"
                  components={{ a: LinkRenderer }}
                >
                  {latestResponse}
                </ReactMarkdown>
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
