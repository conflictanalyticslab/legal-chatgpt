import SideNav from "../SideNav/SideNav";
import ChatOptions from "./components/ChatOptions/ChatOptions";
import SideBar from "./components/SideBar/SideBar";
import { ChatContextProvider } from "./store/ChatContext";

export default function LoggedInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[auto_1fr_auto]">
      <ChatContextProvider>
        <SideNav />
        <div className="w-full h-full flex">{children}</div>
        <ChatOptions />
      </ChatContextProvider>
    </div>
  );
}
