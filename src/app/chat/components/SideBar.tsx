"use client";

import { useCallback, useState, useContext, useEffect, use } from "react";
import { getAuth, signOut } from "firebase/auth";
import Link from "next/link";
import styles from "@/styles/SideBar.module.css";

import ArticleIcon from "@mui/icons-material/Article";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import { redirect } from "next/dist/server/api-utils";
import { auth } from "@/firebase";

export default function SideBar() {
  const onLogout = useCallback(() => {
    void auth.signOut();
  }, [auth]);


  const navDataLink = [
    {
      id: 0,
      text: "About Us",
      link: "https://conflictanalytics.queenslaw.ca/",
    },
    {
      id: 1,
      text: "Publications",
      link: "https://conflictanalytics.queenslaw.ca/publications",
    },
    {
      id: 2,
      text: "Blogs",
      link: "https://myopencourt.org/blog/",
    },
    {
      id: 3,
      text: "FAQs",
      link: "https://myopencourt.org/faqs/",
    },
    {
      id: 4,
      text: "Contact",
      link: "mailto:conflict.analytics@gmail.com",
    },
  ];

  const [open, setOpen] = useState(false);
  const [chatHistoryOpen, setChatHistoryOpen] = useState(false);
  const toggleOpen = () => {
    setOpen(!open);
  };
  return (
    <div
      className={`z-[5] ${open ? styles.sidenav : styles.sidenavClosed}`}
      style={{ overflow: "hidden" }}
    >
      <button
        className={open ? styles.menuOpen : styles.menuBtn}
        onClick={toggleOpen}
      >
        <MenuIcon />
      </button>
      <div className={styles.aboutBar}>
        {open &&
          navDataLink.map((item) => {
            return (
              <Link
                key={item.id}
                className={styles.sideitemLink}
                href={item.link}
              >
                <span className={styles.linkTextAbout}>{item.text}</span>
              </Link>
            );
          })}
      </div>

      <div className={styles.convoBar}>
      
        <Link
          href="/chat"
          key="chat-page-link"
          className={styles.sideitemConvo}
          onClick={() => {
            setOpen(false);
          }}
        >
          <ChatBubbleIcon />
          <span className={styles.linkText}>Chat</span>
        </Link>
        {/* <Link
          href="/chat/documents"
          key="documents-page-link"
          className={styles.sideitemConvo}
          onClick={() => {
            setOpen(false);
          }}
        >
          <ArticleIcon />
          <span className={styles.linkText}>Documents</span>
        </Link> */}
        <Link
          // style={{width:"100%"}}
          href="/"
          key="logout-button"
          className={styles.sideitemConvo}
          onClick={onLogout}
        >
          <LogoutIcon />
          <span className={styles.linkText}>Logout</span>
        </Link>
      </div>
    </div>
  );
}
