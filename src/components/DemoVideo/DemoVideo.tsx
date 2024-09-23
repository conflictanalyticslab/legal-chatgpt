import { cn } from "@/utils/utils";
import { HTMLAttributes } from "react";

interface DemoVideo extends HTMLAttributes<HTMLDivElement> {}
export default function DemoVideo({ className }: DemoVideo) {
  return (
    <video
      autoPlay
      muted
      loop
      playsInline
      preload="none"
      src="/assets/landing_page/landing-page-video.mp4"
      className={cn("shadow-lg rounded-lg max-w-[1000px] w-full md:w-[min(100%, 44vw)] h-fit", className)}
    ></video>
  );
}
