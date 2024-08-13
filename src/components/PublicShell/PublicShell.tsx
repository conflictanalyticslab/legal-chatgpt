import { ReactNode } from "react";
import PublicFooter from "./PublicFooter";
import PublicHeader from "./PublicHeader";

export function PublicShell({
  children,
  showFooter = true,
}: {
  children: ReactNode;
  showFooter?: boolean;
}) {
  return (
    <div className="grid grid-rows-[auto_1fr_auto] min-h-screen">
      <PublicHeader />
      {children}
      {showFooter && <PublicFooter />}
    </div>
  );
}
