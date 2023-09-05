import { ReactNode } from "react";
import PublicFooter from "./PublicFooter";
import PublicHeader from "./PublicHeader";

export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <>
      <PublicHeader />
      {children}
      <PublicFooter />
    </>
  );
}
