import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface DemoVideo extends HTMLAttributes<HTMLDivElement> {}
export default function DemoVideo({ className }: DemoVideo) {
  return (
    <div className="flex items-center justify-center">
      <video
      controls
      src="/assets/landing_page/landing-page-video.mov"
      className={cn("shadow-lg rounded-lg lg:max-w-[min(1000px,45vw)] w-full md:w-[min(100%, 44vw)] mx-auto", className)}
      ></video>
    </div>
  );
}
