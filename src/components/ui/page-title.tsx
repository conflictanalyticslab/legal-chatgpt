import { cn } from "@/utils/utils";
import { HTMLAttributes, ReactNode } from "react";

interface PageTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode;
}
export default function PageTitle({
  children,
  className,
  ...props
}: PageTitleProps) {
  return (
    <h1 className={cn("title font-bold leading-tight", className)} {...props}>
      {children}
    </h1>
  );
}
