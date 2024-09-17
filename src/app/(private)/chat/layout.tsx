import ChatOptions from "./components/ChatOptions/ChatOptions";
import SideNav from "./components/SideNav/SideNav";
import { ChatContextProvider } from "./store/ChatContext";

export default function LoggedInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[auto_1fr]">
      <ChatContextProvider>
        <SideNav />
        <div className="w-full h-full flex">{children}</div>
        <ChatOptions />
      </ChatContextProvider>
    </div>
  );
}
