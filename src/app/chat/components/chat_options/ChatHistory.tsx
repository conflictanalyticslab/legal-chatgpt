import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger } from '@/components/ui/select';
import Image from 'next/image';
import React from 'react'
import { useChatContext } from '../store/ChatContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function ChatHistory({setShowStartupImage}:any) {
  const {conversationTitle, setConversationTitle, conversationTitles} = useChatContext();

  return (
    <>
      {/* Chat History */}
      <Select
        onValueChange={(value: string) => {
          if (value === conversationTitle || value === "") return;
          setShowStartupImage(false);
          setConversationTitle(value);
        }}
        value={conversationTitle}
      >
        <SelectTrigger>
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex gap-3 overflow-hidden">
                  <Image
                    src="/assets/icons/history.svg"
                    height={18}
                    width={18}
                    alt="Jurisdiction"
                  />
                  <span className="whitespace-nowrap text-ellipsis overflow-hidden block">
                    {conversationTitle || "Chat History"}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="left" sideOffset={22}>
                Previous Conversations
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </SelectTrigger>
        <SelectContent align="end">
          <SelectGroup>
            {conversationTitles.map((title: any, i: number) => (
              <SelectItem key={i} value={title.title} className="text-left">
                {title.title}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </>
  );
}
