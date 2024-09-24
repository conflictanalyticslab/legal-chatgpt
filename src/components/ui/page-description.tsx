import { cn } from "@/utils/utils";
import { HTMLAttributes, ReactNode } from "react";

interface pageHeaderDescription extends HTMLAttributes<HTMLParagraphElement> {
  children: ReactNode;
}
export default function PageHeaderDescription({
  children,
  className,
  ...props
}: pageHeaderDescription) {
  return (
    <p className={cn("text-base xl:text-lg", className)} {...props}>
      {children}
    </p>
  );
}
