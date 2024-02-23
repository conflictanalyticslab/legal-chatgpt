import { cn } from "@/lib/utils";
import React from "react";

function Container({ children, className }: any) {
  return (
    <div
      className={cn(
        "px-[30px] max-w-[1000px] 2xl:max-w-[1400px] 3xl:max-w-[1900px] m-auto",
        className
      )}
    >
      {children}
    </div>
  );
}

export default Container;
