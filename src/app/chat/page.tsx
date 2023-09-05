"use client";

import { Chat } from "@/components/Chat/Chat";
import SideBar from "@/components/Chat/SideBar";
import { WithSearch } from "@elastic/react-search-ui";

import { auth } from "@/firebase";
import SearchModal from "@/components/Chat/SearchModal";
import SearchProviderShell from "@/components/Chat/SearchProviderShell";

export default function Page() {
  return (
    <SearchProviderShell>
      <WithSearch
        mapContextToProps={({ wasSearched, setSearchTerm }) => ({
          wasSearched,
          setSearchTerm,
        })}
      >
        {({ wasSearched, setSearchTerm }) => (
          <div
            style={{
              display: "flex",
              height: "100vh",
            }}
          >
            <SideBar
              onLogout={() => {
                try {
                  auth.signOut();
                  console.log("handle logout");
                } catch (error) {
                  console.log(error);
                }
              }}
            />
            <div
              style={{
                width: "100%",
                height: "100%",
                overflow: "scroll",
                justifyContent: "center",
                backgroundColor: "#F5F5F7",
              }}
            >
              <SearchModal
                wasSearched={wasSearched}
                setSearchTerm={setSearchTerm}
              ></SearchModal>
              <Chat setSearchTerm={setSearchTerm} />
            </div>
          </div>
        )}
      </WithSearch>
    </SearchProviderShell>
  );
}
