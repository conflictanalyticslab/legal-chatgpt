"use client"

import { useEffect, useRef } from "react"
import { useGlobalContext } from "@/app/store/global-context"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import ReactMarkdown from "react-markdown"

function LinkRenderer(props: any) {
  return (
    <a
      href={props.href}
      className="underline text-white hover:text-gray-200 transition-colors"
      target="_blank"
      rel="noreferrer"
    >
      {props.children}
    </a>
  )
}

export function Conversation() {
  const { conversation, latestResponse, loading, scrollIntoViewRef } = useGlobalContext()
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [conversation])

  return (
    <div
      id="conversation"
      ref={containerRef}
      className="w-full flex-1 overflow-auto pb-24 bg-gradient-to-br from-blue-900 to-gray-900 text-white"
    >
      <div className="max-w-3xl mx-auto flex flex-col gap-8 p-4">
        {conversation?.map((convoObj: any, i: number) => (
          <Card
            key={i}
            className={cn(
              "border rounded-xl shadow-md p-4",
              {
                "border-blue-500/30 bg-blue-800/60": convoObj.role === "assistant",
                "border-green-500/30 bg-blue-800/50": convoObj.role === "user",
              }
            )}
          >
            <div>
              {/* Speaker name explicitly in white */}
              <p className="font-bold mb-2 text-white">
                {convoObj.role === "user" ? "You" : "RefugeeReview"}
              </p>

              {/* Markdown Content - ensure white text */}
              {convoObj.content && (
                <ReactMarkdown
                  className="prose prose-sm max-w-none text-white"
                  components={{ a: LinkRenderer }}
                >
                  {convoObj.content}
                </ReactMarkdown>
              )}

              {/* Latest assistant response (streaming) */}
              {convoObj.role === "assistant" && i === conversation.length - 1 && (
                <div className="relative mt-2">
                  <ReactMarkdown
                    className="prose prose-sm max-w-none text-white"
                    components={{ a: LinkRenderer }}
                  >
                    {latestResponse}
                  </ReactMarkdown>

                  {loading && latestResponse === "" && (
                    <div className="flex space-x-2 mt-2">
                      <div
                        className="w-2 h-2 bg-white rounded-full animate-bounce"
                        style={{ animationDelay: "0s" }}
                      />
                      <div
                        className="w-2 h-2 bg-white rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      />
                      <div
                        className="w-2 h-2 bg-white rounded-full animate-bounce"
                        style={{ animationDelay: "0.4s" }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>
        ))}
        <span ref={scrollIntoViewRef}></span>
      </div>
    </div>
  )
}
