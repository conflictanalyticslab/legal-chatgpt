import type { Metadata } from "next";
import { PublicShell } from "@/components/PublicShell/PublicShell";
import { GloblaContextProvider } from "@/app/(private)/chat/store/ChatContext";

export const metadata: Metadata = {
  title: "OpenJustice Signup",
  description: "Built by the Conflict Analytics Lab",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <PublicShell>
      <GloblaContextProvider>{children}</GloblaContextProvider>
    </PublicShell>
  );
}
