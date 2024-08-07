import Image from "next/image";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import ChatHistory from "./components/ChatHistory";
import { RagToggle } from "./components/RagToggle/RagToggle";
import { DocumentQueryMethod } from "./components/DocumentQueryMethod/DocumentQueryMethod";
import SearchDocuments from "./components/SearchDocuments";

function ChatOptions() {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    
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

            {/* Document Query Method */}
            <DocumentQueryMethod />

            {/* Enable Rag */}
            <RagToggle />

            {/* Chat History */}
            {/* <ChatHistory /> */}
          </PopoverContent>
        </Popover>

        {/* Ticketing System */}
        {/* <BugReport/> */}
      </div>
    );
}

export default ChatOptions;
