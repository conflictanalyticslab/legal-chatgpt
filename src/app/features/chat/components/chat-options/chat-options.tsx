"use client";
import { FileUp, FolderSearch, Settings2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import SearchDocuments from "../search-documents/search-documents";
import { cn } from "@/lib/utils";
import { useGlobalContext } from "@/app/store/global-context";
import UploadedDocuments from "../uploaded-documents/uploaded-documents";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChatPanelOptions } from "@/app/(private)/chat/enum/enums";

function ChatOptions() {
  const { chatPanelOption, setChatPanelOption } = useGlobalContext();

  const togglechatPanelOption = (actionLabel: string) => {
    if (chatPanelOption === actionLabel) setChatPanelOption(null);
    else setChatPanelOption(actionLabel);
  };

  return (
    <div className="fixed right-2 sm:right-0 top-[60px] h-[calc(100vh-80px)] grid border-3 mt-auto z-[2]">
      <div className="fixed top-3 right-3 p-2 pt-0 flex gap-3 z-10 ">
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger className="!m-0" asChild>
              <Button
                onClick={() =>
                  togglechatPanelOption(ChatPanelOptions.searchDocuments)
                }
                variant={"ghost"}
                className={cn(
                  "p-2 flex justify-center items-center h-fit cursor-pointer hover:bg-initial rounded-sm border-[1px] border-transparent",
                  {
                    "border-border bg-[#f8f8f8]":
                      chatPanelOption === ChatPanelOptions.searchDocuments,
                  }
                )}
              >
                <FolderSearch className="h-[20px] w-[20px]" />
              </Button>
            </TooltipTrigger>
            <TooltipContent align="end" side="bottom"  sideOffset={10}>
              Search Document
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger className="!m-0" asChild>
              <Button
                onClick={() =>
                  togglechatPanelOption(ChatPanelOptions.uploadDocuments)
                }
                variant={"ghost"}
                className={cn(
                  "p-2 flex justify-center items-center h-fit cursor-pointer hover:bg-initial rounded-sm border-[1px] border-transparent",
                  {
                    "border-border bg-[#f8f8f8]":
                      chatPanelOption === ChatPanelOptions.uploadDocuments,
                  }
                )}
              >
                <FileUp className="h-[20px] w-[20px]" />
              </Button>
            </TooltipTrigger>
            <TooltipContent align="end" side="bottom" sideOffset={10}>
              Uploaded Documents
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Chat Options Content */}
      <div
        className={cn(
          "w-0 overflow-y-hidden transition-all duration-500 ease-in-out shadow-3 rounded-md relative pt-0 bg-[#f5f5f7]",
          { "w-[95vw] sm:w-[300px] sm:m-4 mt-0": chatPanelOption }
        )}
      >
        <Button
          variant={"ghost"}
          className={cn("w-auto h-auto p-0 top-4 right-4 absolute transition-all opacity-1 z-20", {
            "opacity-0": !chatPanelOption,
          })}
          onClick={() => setChatPanelOption(null)}
        >
          <X className="h-4 w-4 text-black" />
        </Button>

        {chatPanelOption === ChatPanelOptions.searchDocuments && (
          <SearchDocuments />
        )}
        {chatPanelOption === ChatPanelOptions.uploadDocuments && (
          <UploadedDocuments />
        )}
      </div>
    </div>
  );
}

export default ChatOptions;
