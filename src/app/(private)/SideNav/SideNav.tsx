"use client";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/utils";
import { LogOut, PanelRightClose } from "lucide-react";
import { useState } from "react";
import ChatHistory from "../chat/components/ChatOptions/components/ChatHistory";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/firebase";
import { useRouter } from "next/navigation";

export default function SideNav() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
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
        <div className="grid grid-rows-[1fr_auto] h-screen overflow-hidden pt-[60px]">
          <ChatHistory />
          <Button
            className="my-5 mx-4 flex justify-start gap-3 cursor-pointer border-[1px] border-transparent hover:border-border hover:border-[1px] px-2"
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
