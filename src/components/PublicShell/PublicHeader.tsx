"use client";
import React, { useState } from "react";
import Image from "next/image";
import {
  AppBar,
  Box,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Drawer,
} from "@mui/material";
import useScrollTrigger from "@mui/material/useScrollTrigger";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import logo from "../../images/RobotoLogo.png";
import { BlackMenuIcon, MyToolbar } from "@/styles/styles";
import Container from "../ui/Container";
import { Button } from "../ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

function ElevationScroll({ children }: { children: React.ReactElement }) {
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 0,
    target: undefined, // used to pass in a window ref here but stopped because we don't have an iframe demo anymore
  });

  return React.cloneElement(children, {
    elevation: trigger ? 4 : 0,
  });
}

export function PublicHeader() {
  const links = [
    {
      id: 1,
      route: "About Us",
      url: "https://conflictanalytics.queenslaw.ca/",
    },
    {
      id: 2,
      route: "Publications",
      url: "https://conflictanalytics.queenslaw.ca/publications",
    },
    { id: 3, route: "Blogs", url: "https://myopencourt.org/blog/" },
    { id: 4, route: "FAQs", url: "https://myopencourt.org/faqs/" },
    { id: 5, route: "Waitlist", url: "/waitlist" },
    { id: 6, route: "Login", url: "/login" },
  ];

  const [state, setState] = React.useState({
    right: false,
  });

  const toggleDrawer = (anchor: string, open: boolean) => (event: any) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }

    setState({ ...state, [anchor]: open });
  };

  const list = (anchor: string) => (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer(anchor, false)}
      onKeyDown={toggleDrawer(anchor, false)}
    >
      <List>
        {links.map((link) => (
          <ListItem button key={link.id}>
            <ListItemText primary={link.route} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  const [navOpen, setNavOpen] = useState(false);
  const isTablet = useMediaQuery("(max-width: 768px)");
  return (
    <nav className="fixed z-[2] top-0 left-0 right-0 bg-greyBg py-[10px] sm:py-[15px] border-b-[2px] border-border">
      <Container className="flex justify-between items-center">
        <Link href="/">
          <Image
            src={logo}
            width={200}
            height={40}
            alt="Logo"
            className="w-[200px] sm:w-auto"
          />
        </Link>

        <Button
          variant={"outline"}
          className={cn("bg-greyBg h-auto px-[5px] hidden", {
            flex: isTablet,
          })}
          onClick={() => setNavOpen(!navOpen)}
        >
          <Image
            src={
              !navOpen
                ? "/assets/landing_page/nav_menu.png"
                : "/assets/landing_page/close.svg"
            }
            height={30}
            width={30}
            className="w-[20px] sm:w-auto h-[20px] sm:h-auto"
            alt="menu"
          />
        </Button>

        <div
          className={cn(
            `flex gap-[20px] text-[1.2rem] items-center`,
            {
              hidden: !navOpen && isTablet,
            },
            {
              "flex-col fixed top-[60px] pt-[30px] left-0 right-0 bottom-0 bg-greyBg":
                navOpen && isTablet,
            }
          )}
        >
          {links
            .filter((item) => item.id != 6)
            .map((link) => (
              <Link
                className="text-black no-underline hover:text-primaryOJ"
                href={link.url}
                target="_blank"
                key={link.url}
              >
                {link.route}
              </Link>
            ))}
          <Button
            asChild
            className="bg-primaryOJ px-[20px] border-primaryOJ border-[2px] text-md text-white"
          >
            <Link href={links[links.length - 1].url} className="no-underline">
              {links[links.length - 1].route}
            </Link>
          </Button>
        </div>
      </Container>
    </nav>
  );
}

export default PublicHeader;
