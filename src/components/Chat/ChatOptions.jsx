import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Button } from "../ui/button";
import SearchModal from "@/components/Chat/SearchModal";
import PDFModal from "@/components/Chat/PDFModal";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import Image from "next/image";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { useChatContext } from "./store/ChatContext";

function ChatOptions({ documents, deleteDocumentChat, documentContent, setDocumentContent, includedDocuments, setIncludedDocuments, enableRag, handleEnableRag, conversationTitles, setShowStartupImage, setConversationTitle, conversationTitle }) {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const { setNamespace, documentQueryMethod, setDocumentQueryMethod } = useChatContext();
    return (
      <div className="absolute top-4 right-8">
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
              className="w-full"
              onClick={() => handleEnableRag(!enableRag)}
              asChild
            >
              <div className="w-full flex justify-between">
                <div className="flex gap-5 justify-start">
                  <Image
                    src={"/assets/icons/database.svg"}
                    width={16}
                    height={22}
                    alt={"pdf file"}
                  />
                  <Label className="whitespace-nowrap">Enable RAG</Label>
                </div>
                <Switch checked={enableRag} className="scale-[0.7]" />
              </div>
            </Button>

            <div className="flex flex-col gap-1 pt-1">

              {/* Document Query Method */}
              <Select onValueChange={setDocumentQueryMethod} value={documentQueryMethod}>
                <SelectTrigger className="w-full outline-[none] focus:shadow-none focus:ring-offset-0 focus:ring-0 px-[1rem]">
                  <div className="flex gap-3">
                    <Image
                      src="/assets/icons/scan-search.svg"
                      height={18}
                      width={18}
                      alt="Jurisdiction"
                    />
                    <SelectValue defaultValue={"elastic"} placeholder="Elastic Search" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="elastic">Elastic Search</SelectItem>
                    <SelectItem value="pinecone">
                      Pinecone
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>

              {/* Jurisdiction */}
              <Select onValueChange={setNamespace}>
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
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="french_law">French Law</SelectItem>
                    <SelectItem value="austrialian_law">
                      Austrialian Law
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>

              {/* Chat History */}
              <Select
                onValueChange={(value) => {
                  if (value === conversationTitle || value === "") return;
                  setShowStartupImage(false);
                  setConversationTitle(value);
                }}
                value={conversationTitle}
              >
                <SelectTrigger className="w-full outline-[none] focus:shadow-none focus:ring-offset-0 focus:ring-0 px-[1rem]">
                  <div className="flex gap-3">
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
                <SelectContent>
                  <SelectGroup>
                    {conversationTitles.map((title, i) => (
                      <SelectItem
                        key={i}
                        value={title.title}
                        className="text-left"
                      >
                        {title.title}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    );
}

export default ChatOptions;
