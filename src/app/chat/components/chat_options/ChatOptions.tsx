import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select";
import Image from "next/image";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../../../../components/ui/popover";
import { useChatContext } from "../store/ChatContext";
import { Tooltip } from "@radix-ui/react-tooltip";
import { TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import ChatHistory from "./components/ChatHistory";
import { RagToggle } from "./components/RagToggle/RagToggle";
import { DocumentQueryMethod } from "./components/DocumentQueryMethod";
import SearchDocuments from "./components/SearchDocuments";

function ChatOptions({ documents, deleteDocumentChat, documentContent, setDocumentContent, includedDocuments, setIncludedDocuments, enableRag, setShowStartupImage }:any) {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const { setIndexName, namespace, setNamespace, documentQueryMethod, setDocumentQueryMethod, setEnableRag, globalSearch, setGlobalSearch } = useChatContext();

    const handleEnableRag = (value: boolean) => {
      if (documentQueryMethod === "keyword-search") return;
      setEnableRag(value);
      localStorage.setItem("enableRag", JSON.stringify(value));
    };
    
    // toggle global search
    const toggleGlobalSearch = (value: boolean) => {
      if (documentQueryMethod === "keyword-search") return;
      setGlobalSearch(value);

      if(value) {
        setNamespace('')
        setIndexName('global-search')
      } else {
        setIndexName('legal-pdf-documents')
      }

      localStorage.setItem("globalSearch", JSON.stringify(value));
    };

    return (
      <div className="fixed top-4 right-8">
        <Popover open={dropdownOpen}>
          <PopoverTrigger
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="bg-[none] p-0 h-[50px] w-[50px]"
          >
            <Image
              src="/assets/icons/ellipsis.svg"
              width={30}
              height={40}
              alt="chat options"
            />
          </PopoverTrigger>
          <PopoverContent
            align="end"
            className="flex flex-col gap-1 p-2"
            onInteractOutside={() => setDropdownOpen(false)}
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            {/* Search Relevant Resources */}
            <SearchDocuments />

            {/* Enable Rag */}
            <RagToggle />

            {/* Document Query Method */}
            <DocumentQueryMethod />

            {/* Chat History */}
            <ChatHistory />
          </PopoverContent>
        </Popover>

        {/* Ticketing System */}
        {/* <BugReport/> */}
      </div>
    );
}

export default ChatOptions;
