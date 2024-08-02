import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select";
import { Button } from "../../../../components/ui/button";
import SearchModal from "@/app/chat/components/SearchModal";
import PDFModal from "@/app/chat/components/PDFModal";
import { Label } from "../../../../components/ui/label";
import { Switch } from "../../../../components/ui/switch";
import Image from "next/image";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../../../../components/ui/popover";
import { useChatContext } from "../store/ChatContext";
import ChatHistory from "./ChatHistory";
import { cn } from "@/lib/utils";
import BugReport from "./BugReport";
import { Tooltip } from "@radix-ui/react-tooltip";
import { TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

function ChatOptions({ documents, deleteDocumentChat, documentContent, setDocumentContent, includedDocuments, setIncludedDocuments, enableRag, setShowStartupImage }:any) {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const { setIndexName, namespace, setNamespace, documentQueryMethod, setDocumentQueryMethod, setEnableRag, globalSearch, setGlobalSearch } = useChatContext();

    const handleEnableRag = (value: boolean) => {
      if (documentQueryMethod === "elastic") return;
      setEnableRag(value);
      localStorage.setItem("enableRag", JSON.stringify(value));
    };
    
    // toggle global search
    const toggleGlobalSearch = (value: boolean) => {
      if (documentQueryMethod === "elastic") return;
      setGlobalSearch(value);

      if(value) {
        setNamespace('')
        setIndexName('global-search')
      } else {
        setIndexName('legal-pdf-documents')
      }

      localStorage.setItem("globalSearch", JSON.stringify(value));
    };

    // Sets the appropriate local storage settings when toggling between elastic and keyword search
    const handleChangeDocumentQueryMethod = (queryMethod:string) => {
      if(queryMethod === "elastic"){
        setEnableRag(false);
        setGlobalSearch(false);
        localStorage.setItem("enableRag", JSON.stringify(false));
        localStorage.setItem("globalSearch", JSON.stringify(false));
      }

      setDocumentQueryMethod(queryMethod);
      localStorage.setItem("documentQueryPrevChoice", JSON.stringify(queryMethod));
    }
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
            className="p-1"
            onInteractOutside={() => setDropdownOpen(false)}
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <SearchModal />
            <PDFModal
              disabled={enableRag}
              documents={documents}
              deleteDocument={deleteDocumentChat}
              documentContent={documentContent}
              setDocumentContent={setDocumentContent}
              includedDocuments={includedDocuments}
              setIncludedDocuments={setIncludedDocuments}
            />
            {/* Enable Rag */}
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    asChild
                    >
                    <div
                      onClick={() => handleEnableRag(!enableRag)}
                      className={cn(
                        `w-full flex justify-between items-center`,
                        documentQueryMethod === "elastic"
                          ? "opacity-[0.5]"
                          : "cursor-pointer"
                      )}
                    >
                      <div className="flex gap-5 justify-start">
                        <Image
                          src={"/assets/icons/database.svg"}
                          width={16}
                          height={22}
                          alt={"pdf file"}
                        />
                        Enable RAG
                      </div>
                      <Switch
                        checked={enableRag}
                        className={cn(
                          "scale-[0.7]",
                          documentQueryMethod === "elastic"
                            ? "cursor-default"
                            : "cursor-pointer"
                        )}
                      />
                    </div>
                  </Button>
                </TooltipTrigger>
                <TooltipContent
                  side="left"
                  className={cn({ hidden: documentQueryMethod === "elastic" })}
                >
                  Use retrieval augmented generation (RAG)
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Global Search */}
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    asChild
                  >
                    <div
                      onClick={() => toggleGlobalSearch(!globalSearch)}
                      className={cn(
                        `w-full flex justify-between items-center`,
                        
                         documentQueryMethod === "elastic" ? 'opacity-[0.5]': 'cursor-pointer',
                        
                      )}
                    >
                      <div className="flex gap-5 justify-start">
                        <Image
                          src={"/assets/icons/globe.svg"}
                          width={16}
                          height={22}
                          alt={"pdf file"}
                        />
                        Global Search
                      </div>
                      <Switch
                        checked={globalSearch}
                        className={cn(
                          "scale-[0.7]",
                          documentQueryMethod === "elastic"
                            ? "cursor-default"
                            : "cursor-pointer"
                        )}
                      />
                    </div>
                  </Button>
                </TooltipTrigger>
                <TooltipContent
                  side="left"
                  className={cn("max-w-[400px]",{ hidden: documentQueryMethod === "elastic" })}
                >
                  Global Search allows you to search courtlistener.com for relevant documents and those documents can be used for RAG responses. (Expect longer latency)
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Jurisdiction */}
            <Select
              value={namespace}
              onValueChange={setNamespace}
              disabled={documentQueryMethod === "elastic"}
            >
              <SelectTrigger disabled={globalSearch}>
                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex gap-3">
                        <Image
                          src="/assets/icons/scale.svg"
                          height={18}
                          width={18}
                          alt="Jurisdiction"
                        />
                        <SelectValue placeholder="Choose a Dataset" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent
                      side="left"
                      sideOffset={22}
                      className={cn({
                        hidden: documentQueryMethod === "elastic",
                      })}
                    >
                      Select Jurisdiction to fetch documents from
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </SelectTrigger>
              <SelectContent align="end">
                <SelectGroup>
                  <SelectItem value="french_law">Leiden IAL</SelectItem>
                  <SelectItem value="austrialian_law">
                    Australia Scrutiny
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <div className="flex flex-col gap-1 pt-1">
              {/* Document Query Method */}
              <Select
                onValueChange={handleChangeDocumentQueryMethod}
                value={documentQueryMethod}
              >
                <SelectTrigger>
                  <TooltipProvider delayDuration={100}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex gap-3">
                          <Image
                            src="/assets/icons/scan-search.svg"
                            height={18}
                            width={18}
                            alt="PDF search method"
                          />
                          <SelectValue
                            defaultValue={"elastic"}
                            placeholder="Elastic Search"
                          />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="left" sideOffset={22}>
                        Document search method
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </SelectTrigger>
                <SelectContent align="end">
                  <SelectGroup>
                    <SelectItem value="elastic">Keyword Search</SelectItem>
                    <SelectItem value="semantic-search">
                      Semantic Search
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>

              {/* Chat History */}
              <ChatHistory setShowStartupImage={setShowStartupImage} />
            </div>
          </PopoverContent>
        </Popover>

        {/* Ticketing System */}
        {/* <BugReport/> */}
      </div>
    );
}

export default ChatOptions;
