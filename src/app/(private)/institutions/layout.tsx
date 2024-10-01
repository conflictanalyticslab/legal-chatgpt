import { PublicShell } from "@/components/publicShell/public-shell";
import type { Metadata } from "next";
import { GlobalContextProvider } from "../../store/global-context";

export const metadata: Metadata = {
  title: "OpenJustice Approved Institutions List",
  description: "Built by the Conflict Analytics Lab",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <PublicShell>
      <GlobalContextProvider>{children}</GlobalContextProvider>
    </PublicShell>
  );
}
