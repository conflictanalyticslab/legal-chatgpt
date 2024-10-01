import { useEffect, useState } from "react";
// import { useGlobalContext } from "@/app/store/global-context";
import { Label } from "@/components/ui/label";
import { conversationTitleData } from "@/app/features/chat/models/schema";
import { useGlobalContext } from "@/app/store/global-context";

export default function ChatHistory() {
  const {
    setConversationId,
    conversationTitles,
    setShowStartupImage,
    setIsNavOpen,
  } = useGlobalContext();

  const handleChangeConversation = (conversationId: string) => {
    setConversationId(conversationId);
    setShowStartupImage(false);
    if (window.innerWidth <= 1024) setIsNavOpen(false);
  };

  const [todayConvos, setTodayConvos] = useState<conversationTitleData[]>([]);
  const [yesterdayConvos, setYesterdayConvos] = useState<
    conversationTitleData[]
  >([]);
  const [pastWeekConvos, setPastWeekConvos] = useState<conversationTitleData[]>(
    []
  );
  const [oldConvos, setOldConvos] = useState<conversationTitleData[]>([]);

  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );
  const startOfYesterday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - 1
  );
  const startOfWeek = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - 7
  );

  useEffect(() => {
    const today: conversationTitleData[] = [];
    const yesterday: conversationTitleData[] = [];
    const pastWeek: conversationTitleData[] = [];
    const older: conversationTitleData[] = [];

    conversationTitles.forEach((convo: conversationTitleData) => {
      const updatedAt = new Date(convo.updatedAt);

      if (updatedAt >= startOfToday) {
        today.push(convo);
      } else if (updatedAt >= startOfYesterday && updatedAt < startOfToday) {
        yesterday.push(convo);
      } else if (updatedAt >= startOfWeek && updatedAt < startOfYesterday) {
        pastWeek.push(convo);
      } else {
        older.push(convo);
      }
    });

    setTodayConvos(today);
    setYesterdayConvos(yesterday);
    setPastWeekConvos(pastWeek);
    setOldConvos(older);
  }, [conversationTitles]);

  return (
    <div className="overflow-auto">
      {/* Todays Convos */}
      {todayConvos && todayConvos.length > 0 && (
        <div>
          <Label className="text-[#838383] mb-2 px-4">Today</Label>
          <div className="px-4 pb-6 overflow-auto h-full">
            {todayConvos.map((item: any, key: number) => (
              <button
                key={key}
                type="button"
                onClick={() => handleChangeConversation(item.conversationId)}
                className="w-full text-left text-ellipsis text-nowrap px-3 py-2 overflow-hidden hover:bg-[#F1F1F1] rounded-md"
              >
                {item.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Yesterday Convos */}
      {yesterdayConvos && yesterdayConvos.length > 0 && (
        <div>
          <Label className="text-[#838383] mb-2 px-4">Yesterday</Label>
          <div className="px-4 pb-6 overflow-auto h-full">
            {yesterdayConvos.map((item: any, key: number) => (
              <button
                key={key}
                type="button"
                onClick={() => handleChangeConversation(item.conversationId)}
                className="w-full text-left text-ellipsis text-nowrap px-3 py-2 overflow-hidden hover:bg-[#F1F1F1] rounded-md"
              >
                {item.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Past Week Convos */}
      {pastWeekConvos && pastWeekConvos.length > 0 && (
        <div>
          <Label className="text-[#838383] mb-2 px-4">Past Week</Label>
          <div className="px-4 pb-6 overflow-auto h-full">
            {pastWeekConvos.map((item: any, key: number) => (
              <button
                key={key}
                type="button"
                onClick={() => handleChangeConversation(item.conversationId)}
                className="w-full text-left text-ellipsis text-nowrap px-3 py-2 overflow-hidden hover:bg-[#F1F1F1] rounded-md"
              >
                {item.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Older Convos */}
      {oldConvos && oldConvos.length > 0 && (
        <div>
          <Label className="text-[#838383] mb-2 px-4">Older</Label>
          <div className="px-4 pb-6 overflow-auto h-full">
            {oldConvos.map((item: any, key: number) => (
              <button
                key={key}
                type="button"
                onClick={() => handleChangeConversation(item.conversationId)}
                className="w-full text-left text-ellipsis text-nowrap px-3 py-2 overflow-hidden hover:bg-[#F1F1F1] rounded-md"
              >
                {item.title}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
