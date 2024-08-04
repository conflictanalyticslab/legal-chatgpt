import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { BookOpenText  } from "lucide-react"
import { DatasetSelection } from "./components/DatasetSelection"
import UploadedDocuments from "./components/UploadedDocuments"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useChatContext } from "../../../store/ChatContext"
import { Switch } from "@/components/ui/switch"


export function RagToggle() {
  const {enableRag, setEnableRag} = useChatContext();
  return (
    <Tabs defaultValue={enableRag ? "enable-rag" : "disable-rag"} value={enableRag ? "enable-rag" : "disable-rag"}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button className="w-full flex justify-between px-3" variant={"outline"} onClick={()=>setEnableRag(!enableRag)}>
              <div className="flex justify-start gap-3 items-center">
                <BookOpenText  width={15} height={15} />
                Enable RAG
              </div>
              <Switch className="scale-[0.7]" checked={enableRag} onCheckedChange={setEnableRag} />
            </Button>
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
