import { ReactNode } from "react";
import PublicFooter from "./public-footer";
import PublicHeader from "./public-header";
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
