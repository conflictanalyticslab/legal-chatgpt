import "./globals.css";
import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import { IncludedDocumentsProvider } from "@/hooks/useIncludedDocuments";
import { GoogleAnalytics } from "@next/third-parties/google";
const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "OpenJustice",
  description: "Built by the Conflict Analytics Lab",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${roboto.className} bg-greyBg`}>
        <IncludedDocumentsProvider>{children}</IncludedDocumentsProvider>
      </body>
      <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_MEASUREMENT_ID || ""} />
    </html>
  );
}
