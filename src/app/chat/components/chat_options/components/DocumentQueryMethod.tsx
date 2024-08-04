import { useChatContext } from "@/app/chat/components/store/ChatContext";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import Image from "next/image";

export function DocumentQueryMethod() {
  const { documentQueryMethod, handleChangeDocumentQueryMethod } = useChatContext();
  return (
    <Select
      onValueChange={handleChangeDocumentQueryMethod}
      value={documentQueryMethod}
    >
      <SelectTrigger className="text-nowrap overflow-hidden text-ellipsis">
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
                <SelectValue defaultValue={"keyword-search"} className="text-ellipsis" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="left" sideOffset={22}>
              Resource Search Method
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </SelectTrigger>
      <SelectContent align="end">
        <SelectGroup>

        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
            <SelectItem value="keyword-search">Keyword Document Search</SelectItem>
   
            </TooltipTrigger>
            <TooltipContent side="left" sideOffset={22}>
              Search CourtListener 
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
          <SelectItem value="static-semantic-search">
            Semantic Document Search
          </SelectItem>
          <SelectItem value="dynamic-semantic-search">
            Global Document Search
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
