import { useChatContext } from "../../../store/ChatContext";
import { Label } from "@/components/ui/label";

export default function ChatHistory() {
  const { setConversationTitle, conversationTitles, setShowStartupImage } =
    useChatContext();

  const handleChangeConversation = (title: string) => {
    setConversationTitle(title);
    setShowStartupImage(false);
  };

  return (
    <div className="overflow-hidden">
      <Label className="text-[#838383] mb-2 px-4">Previous Conversations</Label>
      {/* Chat History */}
      <div className="px-4 pb-6 overflow-auto h-full">
        {conversationTitles.map((item: any, key: number) => (
          <button
            key={key}
            type="button"
            onClick={() => handleChangeConversation(item.title)}
            className="w-full text-left text-ellipsis text-nowrap px-3 py-2 overflow-hidden hover:bg-[#F1F1F1] rounded-md"
          >
            {item.title}
          </button>
        ))}
      </div>
    </div>
  );
}
