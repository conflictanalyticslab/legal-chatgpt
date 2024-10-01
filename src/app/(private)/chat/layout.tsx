import SideNav from "@/app/features/chat/components/side-nav/side-nav";
import { GlobalContextProvider } from "../../store/global-context";
import ChatOptions from "@/app/features/chat/components/chat-options/chat-options";

export default function LoggedInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] h-screen overflow-hidden">
      <GlobalContextProvider>
        <div className="fixed top-0 right-0 left-0 bg-[#f5f5f7] w-screen h-[60px] z-[2]" />
        <SideNav />
        <ChatOptions />
        <div className="w-full h-screen overflow-hidden flex">{children}</div>
      </GlobalContextProvider>
    </div>
  );
}
