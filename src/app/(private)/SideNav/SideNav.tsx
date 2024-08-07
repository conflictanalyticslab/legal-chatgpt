"use client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PanelRightClose } from "lucide-react";
import { useState } from "react";
import ChatHistory from "../chat/components/ChatOptions/components/ChatHistory";

export default function SideNav() {
  const [isNavOpen, setIsNavOpen] = useState(false);

  return (
    <nav
      className={cn(
        " w-full relative transition-all flex flex-col w-[60px] border-r-[#e2e8f0] duration-300 ease-in-out h-screen overflow-auto",
        {
          "w-[350px] shadow-2": isNavOpen,
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
      {isNavOpen && <ChatHistory />}
    </nav>
  );
}
