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

function ChatOptions({ documents, deleteDocumentChat, documentContent, setDocumentContent, includedDocuments, setIncludedDocuments, enableRag, conversationTitles, setShowStartupImage, conversationTitle }:any) {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const { setNamespace, documentQueryMethod, setDocumentQueryMethod, setEnableRag } = useChatContext();

    const handleEnableRag = (value: boolean) => {
      if (documentQueryMethod === "elastic") return;
      setEnableRag(value);
      localStorage.setItem("enableRag", JSON.stringify(value));
    };

    const handleChangeDocumentQueryMethod = (queryMethod:string) => {
      if(queryMethod === "elastic"){
        setEnableRag(false);
        localStorage.setItem("enableRag", JSON.stringify(false));
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
            <Button
              variant="ghost"
              className={cn(`w-full`)}
              onClick={() => handleEnableRag(!enableRag)}
              asChild
            >
              <div
                className={cn(`w-full flex justify-between items-center`, {
                  "opacity-[0.5]": documentQueryMethod === "elastic",
                })}
              >
                <div className="flex gap-5 justify-start">
                  <Image
                    src={"/assets/icons/database.svg"}
                    width={16}
                    height={22}
                    alt={"pdf file"}
                  />
                  <Label className="whitespace-nowrap">Enable RAG</Label>
                </div>
                <Switch
                  disabled={documentQueryMethod === "elastic"}
                  checked={enableRag}
                  className="scale-[0.7]"
                />
              </div>
            </Button>

            {/* Jurisdiction */}
            <Select
              onValueChange={setNamespace}
              disabled={documentQueryMethod === "elastic"}
            >
              <SelectTrigger className="w-full outline-[none] focus:shadow-none focus:ring-offset-0 focus:ring-0 px-[1rem]">
                <div className="flex gap-3">
                  <Image
                    src="/assets/icons/scale.svg"
                    height={18}
                    width={18}
                    alt="Jurisdiction"
                  />
                  <SelectValue placeholder="Choose a Jurisdiction" />
                </div>
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
                <SelectTrigger className="w-full outline-[none] focus:shadow-none focus:ring-offset-0 focus:ring-0 px-[1rem]">
                  <div className="flex gap-3">
                    <Image
                      src="/assets/icons/scan-search.svg"
                      height={18}
                      width={18}
                      alt="Jurisdiction"
                    />
                    <SelectValue
                      defaultValue={"elastic"}
                      placeholder="Elastic Search"
                    />
                  </div>
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

        <BugReport/>
      </div>
    );
}

export default ChatOptions;
