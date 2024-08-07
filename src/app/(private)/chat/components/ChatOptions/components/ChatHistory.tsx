import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { useChatContext } from "../../../store/ChatContext";
import { Label } from "@/components/ui/label";

export default function ChatHistory() {
  const {
    setConversationTitle,
    conversationTitles,
    setShowStartupImage,
  } = useChatContext();

  const handleChangeConversation = (title:string)=>{
    setConversationTitle(title)
    setShowStartupImage(false);
  }

  return (
    <div className="flex flex-col px-4 mt-[60px]">
      <Label className="text-[#838383] mb-2">
        Previous Conversations
      </Label>
      {/* Chat History */}
      {conversationTitles.map((item: any) => (
        <button type="button" onClick={()=>handleChangeConversation(item.title)} className="w-full text-left text-ellipsis text-nowrap px-3 py-2 overflow-hidden hover:bg-[#F1F1F1] rounded-md">{item.title}</button>
      ))}
    </div>
  );
}
