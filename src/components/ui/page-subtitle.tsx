import { cn } from "@/lib/utils";
import { HTMLAttributes, ReactNode } from "react";

interface PageSubtitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode;
}
export default function PageSubtitle({
  children,
  className,
  ...props
}: PageSubtitleProps) {
  return (
    <h2 className={cn("sub-title font-bold leading-tight", className)} {...props}>
      {children}
    </h2>
  );
}
