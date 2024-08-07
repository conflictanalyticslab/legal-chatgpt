import { Button } from "@/components/ui/button"
import {
  Tabs,
  TabsContent,
} from "@/components/ui/tabs"
import { BookOpenText  } from "lucide-react"
import { DatasetSelection } from "./components/DatasetSelection"
import UploadedDocuments from "./components/UploadedDocuments"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useChatContext } from "../../../../store/ChatContext"
import { Switch } from "@/components/ui/switch"


export function RagToggle() {
  const {enableRag, handleEnableRag} = useChatContext();
  return (
    <Tabs
      defaultValue={enableRag ? "enable-rag" : "disable-rag"}
      value={enableRag ? "enable-rag" : "disable-rag"}
    >
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="relative">
              <Button
                className="w-full flex justify-between px-3"
                variant={"outline"}
                onClick={() => handleEnableRag(!enableRag)}
              >
                <div className="flex justify-start gap-3 items-center">
                  <BookOpenText width={15} height={15} />
                  Enable RAG
                </div>
              </Button>
              <Switch
                className="scale-[0.7] absolute right-3 bottom-[50%] translate-y-[50%]"
                checked={enableRag}
                onCheckedChange={handleEnableRag}
              />
            </div>
          </TooltipTrigger>
          <TooltipContent side="left" sideOffset={9}>
            Retrieval Augmented Generation (RAG)
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      {/* Normal LLM */}
      <TabsContent value="disable-rag" className="mt-[0.2rem]">
        <UploadedDocuments />
      </TabsContent>
      {/* Normal LLM with RAG */}
      <TabsContent value="enable-rag" className="mt-[0.2rem]">
        <DatasetSelection />
      </TabsContent>
    </Tabs>
  );
}
