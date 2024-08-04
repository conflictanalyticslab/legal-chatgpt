import { useChatContext } from "@/app/chat/components/store/ChatContext";
import { SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Select } from "@radix-ui/react-select";
import Image from "next/image";

export function DatasetSelection() {
  const {namespace, setNamespace, documentQueryMethod, globalSearch } = useChatContext();

  return (
    <Select
    value={namespace}
    onValueChange={setNamespace}
  >
    <SelectTrigger>
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
              hidden: documentQueryMethod === "keyword-search",
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
  )
}
