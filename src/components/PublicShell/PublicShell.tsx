import { ReactNode } from "react";
import PublicFooter from "./PublicFooter";
import PublicHeader from "./PublicHeader";
import { Toaster } from "../ui/toaster";

export function PublicShell({
  children,
  showFooter = true,
}: {
  children: ReactNode;
  showFooter?: boolean;
}) {
  return (
    <>
      <Toaster />
      <PublicHeader />
      {children}
      {showFooter && <PublicFooter />}
    </>
  );
}
