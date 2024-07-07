import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger } from '@/components/ui/select';
import Image from 'next/image';
import React from 'react'
import { useChatContext } from '../store/ChatContext';

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
        <SelectTrigger className="w-full outline-[none] focus:shadow-none focus:ring-offset-0 focus:ring-0 px-[1rem]">
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
