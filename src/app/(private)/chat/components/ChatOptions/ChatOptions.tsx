"use client";
import { FileUp, FolderSearch, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import SearchDocuments from "./components/SearchDocuments";
import { cn } from "@/utils/utils";
import { ChatAction } from "../../enum/enums";
import { useChatContext } from "../../store/ChatContext";
import UploadDocument from "../ConversationQuery/UploadDocument/UploadDocument";
import UploadedDocuments from "./components/UploadedDocuments";
import DatasetOptions from "./components/DatasetOptions";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function ChatOptions() {
  const { chatAction, setChatAction } = useChatContext();

  const toggleChatAction = (actionLabel: string) => {
    if (chatAction === actionLabel) setChatAction(null);
    else setChatAction(actionLabel);
  };

  return (
    <div className="relative h-screen grid border-solid border-[1px] border-border">
      <div className="absolute left-[-150px] p-2 flex gap-3">
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger className="!m-0" asChild>
              <Button
                onClick={() => toggleChatAction(ChatAction.searchDocuments)}
                variant={"ghost"}
                className={cn("p-2 cursor-pointer hover:bg-initial", {
                  "bg-[#E2E8F0]": chatAction === ChatAction.searchDocuments,
                })}
              >
                <FolderSearch className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent align="end" sideOffset={10}>
              Search Document
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger className="!m-0" asChild>
              <Button
                onClick={() => toggleChatAction(ChatAction.uploadDocuments)}
                variant={"ghost"}
                className={cn("p-2 cursor-pointer hover:bg-initial", {
                  "bg-[#E2E8F0]": chatAction === ChatAction.uploadDocuments,
                })}
              >
                <FileUp className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent align="end" sideOffset={10}>
              Uploaded Documents
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger className="!m-0" asChild>
              <Button
                onClick={() => toggleChatAction(ChatAction.dataFilters)}
                variant={"ghost"}
                className={cn("p-2 cursor-pointer hover:bg-initial", {
                  "bg-[#E2E8F0]": chatAction === ChatAction.dataFilters,
                })}
              >
                <Settings2 className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent align="end" sideOffset={10}>
              Dataset Filters
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div
        className={cn(
          "w-0 overflow-y-hidden transition-all duration-300 ease-in-out",
          { "px-2 w-[300px]": chatAction }
        )}
      >
        {chatAction === ChatAction.searchDocuments && <SearchDocuments />}
        {chatAction === ChatAction.uploadDocuments && <UploadedDocuments />}
        {chatAction === ChatAction.dataFilters && <DatasetOptions />}
      </div>
    </div>
  );
}

export default ChatOptions;
