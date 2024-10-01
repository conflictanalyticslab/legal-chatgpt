import { cn } from "@/lib/utils";
import React from "react";

function Container({ children, className, id }: any) {
  return (
    <div
      id={id}
      className={cn(
        "px-[15px] sm:px-[80px] max-w-[1900px] m-auto",
        className
      )}
    >
      {children}
    </div>
  );
}

export default Container;
