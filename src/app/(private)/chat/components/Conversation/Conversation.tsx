import { Card } from "@/components/ui/card";
import { useChatContext } from "../../store/ChatContext";
import { cn } from "@/utils/utils";
import ReactMarkdown from "react-markdown";

function LinkRenderer(props: any) {
  return (
    <a href={props.href} className="underline" target="_blank" rel="noreferrer">
      {props.children}
    </a>
  );
}

export function Conversation() {
  const { conversation, latestResponse, loading, scrollIntoViewRef } =
    useChatContext();
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
              <ReactMarkdown 
                className="flex flex-col items-start gap-[10px] llm-markdown"
                components={{ a: LinkRenderer }}
              >
                {convoObj?.content}
              </ReactMarkdown>
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
      </div>
    </div>
  );
}
