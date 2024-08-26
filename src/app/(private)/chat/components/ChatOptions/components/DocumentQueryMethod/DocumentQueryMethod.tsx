import { useChatContext } from "@/app/(private)/chat/store/ChatContext";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import Image from "next/image";

import "./DocumentQueryMethod.css"
import { DocumentQueryOptions } from "@/app/(private)/chat/enum/enums";

export function DocumentQueryMethod() {
  const { documentQueryMethod, handleChangeDocumentQueryMethod } = useChatContext();
  return (
    <Select
      onValueChange={handleChangeDocumentQueryMethod}
      value={documentQueryMethod}
    >
      <SelectTrigger className="text-nowrap overflow-hidden text-ellipsis">
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className="flex gap-3 overflow-hidden text-ellipsis"
                data-selected-value=""
              >
                <Image
                  src="/assets/icons/scan-search.svg"
                  height={18}
                  width={18}
                  alt="PDF search method"
                />
                <SelectValue
                  defaultValue={DocumentQueryOptions.keywordSearchValue}
                  className="text-ellipsis overflow-hidden"
                />
              </div>
            </TooltipTrigger>
            <TooltipContent side="left" sideOffset={22} className="w-[400px] flex flex-col text-wrap text-left gap-3">
              <span>
                <b>{DocumentQueryOptions.keywordSearchLabel}: </b><br/> Search documents on CourtListener based on keywords from query.
              </span>
              <span>
                <b>{DocumentQueryOptions.semanticSearchLabel}: </b><br/> Search static documents based on query similarities.
              </span>
              <span>
                <b>{DocumentQueryOptions.globalSearchLabel}: </b><br/> Search documents on CourtListener based on query similarities (Longer latency).
              </span>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </SelectTrigger>
      <SelectContent align="end">
        <SelectGroup>
          {/* Keyword Search */}
          <SelectItem value={DocumentQueryOptions.keywordSearchValue}>
            {DocumentQueryOptions.keywordSearchLabel}
          </SelectItem>
          {/* Semantic Search */}
          <SelectItem value={DocumentQueryOptions.semanticSearchValue}>
            {DocumentQueryOptions.semanticSearchLabel}
          </SelectItem>
          {/* Global Search */}
          <SelectItem value={DocumentQueryOptions.globalSearchValue}>
            {DocumentQueryOptions.globalSearchLabel}
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
