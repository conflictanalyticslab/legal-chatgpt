import SideNav from "../SideNav/SideNav";
import SideBar from "./components/SideBar/SideBar";
import { ChatContextProvider } from "./store/ChatContext";

export default function LoggedInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full">
      <ChatContextProvider>
        <SideNav />
        <div
          style={{
            width: "100%",
            height: "100%",
            overflow: "auto",
            justifyContent: "center",
            display: "flex",
            backgroundColor: "#F5F5F7",
          }}
        >
          {children}
        </div>
      </ChatContextProvider>
    </div>
  );
}
