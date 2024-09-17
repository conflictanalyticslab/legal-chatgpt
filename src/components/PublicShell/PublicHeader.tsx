"use client";
import React, { useState } from "react";
import Image from "next/image";
import Container from "../ui/Container";
import { Button } from "../ui/button";
import Link from "next/link";
import { cn } from "@/utils/utils";
import { Menu, X } from "lucide-react";

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
    { id: 4, route: "FAQs", url: "/faq" },
    { id: 5, route: "Waitlist", url: "/waitlist" },
    { id: 6, route: "Login", url: "/login" },
  ];

  const [navOpen, setNavOpen] = useState(false);
  return (
    <nav className="bg-greyBg py-[10px] sm:py-[15px] border-b-[1px] border-border">
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
          className={cn("bg-greyBg h-auto px-[5px] lg:hidden flex")}
          onClick={() => setNavOpen(true)}
        >
          {!navOpen && <Menu className="h-[30px] w-[30px]" />}
        </Button>

        <div
          className={cn(
            `lg:flex gap-[20px] text-[1.2rem] items-center z-[2]`,
            {
              'hidden': !navOpen,
            },
            {
              "flex-col fixed top-[0] pt-[90px] left-0 right-0 bottom-0 bg-greyBg":
                navOpen,
            }
          )}
        >
          {navOpen && (
            <Button onClick={() => setNavOpen(false)} variant={"ghost"} className="fixed top-3   right-3">
              <X className="h-[25px] w-[25px]" />
            </Button>
          )}
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
            variant={'ghost'}
            className="bg-primaryOJ hover:bg-primaryOJ/90 px-[20px] border-primaryOJ border-[2px] text-md text-white hover:text-white"
          >
            <Link href={links[links.length - 1].url}>
            {links[links.length - 1].route}

            </Link>
          </Button>
        </div>
      </Container>
    </nav>
  );
}

export default PublicHeader;
