import ChatOptions from "./components/ChatOptions/ChatOptions";
import SideNav from "./components/SideNav/SideNav";
import { GloblaContextProvider } from "./store/ChatContext";

export default function LoggedInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] h-screen overflow-hidden">
      <GloblaContextProvider>
        <div className="fixed top-0 right-0 left-0 bg-[#f5f5f7] w-screen h-[60px] z-[2]" />
        <SideNav />
        <ChatOptions />
        <div className="w-full h-screen overflow-hidden flex">{children}</div>
      </GloblaContextProvider>
    </div>
  );
}
