"use client";
import React, { useState } from "react";
import Image from "next/image";
import useMediaQuery from "@mui/material/useMediaQuery";
import logo from "../../images/RobotoLogo.png";
import { BlackMenuIcon, MyToolbar } from "@/styles/styles";
import Container from "../ui/Container";
import { Button } from "../ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";

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

  const [navOpen, setNavOpen] = useState(false);
  const isTablet = useMediaQuery("(max-width: 850px)");
  return (
    <nav className="bg-greyBg py-[10px] sm:py-[15px] border-b-[2px] border-border">
      <Container className="flex justify-between items-center">
        <Link href="/">
          <Image
            src={"/assets/icons/logo.svg"}
            width={200}
            height={40}
            alt="Logo"
          />
        </Link>

        <Button
          variant={"ghost"}
          className={cn("bg-greyBg h-auto px-[5px] hidden", {
            flex: isTablet,
          })}
          onClick={() => setNavOpen(!navOpen)}
        >
          {!navOpen ? (
            <Menu className="h-[30px] w-[30px]" />
          ) : (
            <Menu className="h-[30px] w-[30px]" />
          )}
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
                className="text-black no-underline hover:text-primaryOJ text-nowrap"
                href={link.url}
                target="_blank"
                key={link.url}
              >
                {link.route}
              </Link>
            ))}
          <Button
            asChild
            className="bg-primaryOJ hover:bg-primaryOJ/90 px-[20px] border-primaryOJ border-[2px] text-md text-white"
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
