"use client"

import type React from "react"

import { useState } from "react"
import { useGlobalContext } from "@/app/store/global-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { UploadCloud, MessageSquare, Pause, Send, SquareMinus } from "lucide-react"
import useFetchQuery from "@/app/features/chat/hooks/use-fetch-query"
import { useGlobalDialogFlowStore } from "../dialog-flows/store"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function ConversationQuery() {
  const { loading, userQuery, setUserQuery, num, stopQuery } = useGlobalContext()
  const { compiledDialogFlow, setCompiledDialogFlow } = useGlobalDialogFlowStore()
  const { fetchQuery } = useFetchQuery()
  const [isHovered, setIsHovered] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    fetchQuery(userQuery)
  }

  return (
    <TooltipProvider>
      <form
        className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 w-full fixed bottom-0 left-0 right-0 py-4 border-t"
        onSubmit={handleSubmit}
      >
        <div className="relative flex h-[56px] max-w-3xl mx-auto px-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" className="absolute left-6 top-1/2 -translate-y-1/2">
                <UploadCloud className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Upload Document</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" className="absolute left-16 top-1/2 -translate-y-1/2">
                <MessageSquare className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Open Flow Modal</TooltipContent>
          </Tooltip>

          <Input
            className="pl-28 pr-20 h-full focus-visible:ring-2 text-base"
            placeholder="Ask RefugeeReview"
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          />

          {loading ? (
            <Button
              className="absolute right-6 top-1/2 -translate-y-1/2"
              variant="ghost"
              size="icon"
              onClick={stopQuery}
            >
              <Pause className="h-4 w-4" />
            </Button>
          ) : (
            <Button className="absolute right-6 top-1/2 -translate-y-1/2" variant="ghost" size="icon" type="submit">
              <Send className="h-4 w-4" />
            </Button>
          )}

          {isHovered && (
            <div className="absolute -top-10 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-2 rounded-md shadow-md text-sm flex justify-between items-center">
              <span className="text-muted-foreground italic">
                {num === 0 ? "No more prompts allowed. Please enter your final feedback." : `Prompts left: ${num}`}
              </span>
              <span className="text-muted-foreground italic">
                {compiledDialogFlow ? `Dialog Flow in use: ${compiledDialogFlow.name}` : ""}
              </span>
              {compiledDialogFlow && (
                <Button variant="ghost" size="sm" className="ml-2" onClick={() => setCompiledDialogFlow(null)}>
                  <SquareMinus className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </form>
    </TooltipProvider>
  )
}

