import type { Metadata } from "next";
import { PublicShell } from "@/components/PublicShell/PublicShell";

export const metadata: Metadata = {
  title: "OpenJustice FAQ",
  description: "Built by the Conflict Analytics Lab",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <PublicShell>{children}</PublicShell>;
}
