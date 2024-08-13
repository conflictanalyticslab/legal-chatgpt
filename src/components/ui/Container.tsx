import { cn } from "@/lib/utils";
import React from "react";

function Container({ children, className, id }: any) {
  return (
    <div
      id={id}
      className={cn(
        "px-[15px] sm:px-[30px] max-w-[1300px] 2xl:max-w-[1400px] 3xl:max-w-[1900px] m-auto",
        className
      )}
    >
      {children}
    </div>
  );
}

export default Container;
