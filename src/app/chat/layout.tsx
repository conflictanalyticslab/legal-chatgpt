import SideBar from "@/app/chat/components/SideBar";

export default function LoggedInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        height: "100%",
      }}
    >
      <SideBar />
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
    </div>
  );
}
