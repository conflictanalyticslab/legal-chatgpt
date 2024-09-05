"use client";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/utils";
import { LogOut, MessageSquare, PanelRightClose } from "lucide-react";
import { useContext, useState } from "react";
import ChatHistory from "../ChatOptions/components/ChatHistory";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/firebase";
import { useRouter } from "next/navigation";
import { useChatContext } from "../../store/ChatContext";

export default function SideNav() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const {
    setConversation,
    setConversationId,
    setDocumentQuery,
    setShowStartupImage,
    loading,
    pdfLoading,
  } = useChatContext();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  const handleNewConversation = () => {
    setConversation([]);
    setShowStartupImage(true);
    setDocumentQuery("");
    setConversationId("");
  };

  return (
    <nav
      className={cn(
        "relative transition-all flex flex-col w-[60px] border-r-[#e2e8f0] duration-300 ease-in-out h-screen overflow-auto scrollbar-thin",
        {
          "w-[350px] shadow-3": isNavOpen,
        }
      )}
    >
      <Button
        variant={"ghost"}
        className="absolute top-3 right-3 p-2"
        onClick={() => setIsNavOpen(!isNavOpen)}
      >
        <PanelRightClose className="w-[20px] h-[20px]" />
      </Button>
      {isNavOpen && (
        <div className="grid grid-rows-[auto_1fr_auto] mx-2 h-screen overflow-hidden pt-[60px]">
          <Button
            disabled={loading || pdfLoading}
            variant={"ghost"}
            onClick={handleNewConversation}
            className="my-5 mx-5 flex justify-start gap-3 cursor-pointer border-[1px] border-transparent border-border border-[1px] px-2"
          >
            <MessageSquare className="h-5 w-5" />
            New Conversation
          </Button>
          <ChatHistory />
          <Button
            className="my-5 mx-5 flex justify-start gap-3 cursor-pointer border-[1px] border-transparent border-border border-[1px] px-2"
            variant={"ghost"}
            onClick={() => handleLogout()}
          >
            <>
              <LogOut className="h-5 w-5" />
              Log Out
            </>
          </Button>
        </div>
      )}
    </nav>
  );
}
