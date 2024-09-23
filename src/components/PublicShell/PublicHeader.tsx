"use client";
import React, { useState } from "react";
import Image from "next/image";
import Container from "../ui/container";
import { Button } from "../ui/button";
import Link from "next/link";
import { cn } from "@/utils/utils";
import { Menu, X } from "lucide-react";
import oj_logo from "@/assets/oj_logo.png";
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
  ];

  const [navOpen, setNavOpen] = useState(false);
  return (
    <nav className="bg-greyBg py-[10px] sm:py-[15px] border-b-[1px] border-border">
      <Container className="grid grid-cols-[auto_1fr_auto] justify-between items-center">
        <Link href="/">
          <Image src={oj_logo} width={150} height={150} alt="Logo" />
        </Link>

        {/* Menu Button */}
        <Button
          variant={"ghost"}
          className={cn(
            "bg-greyBg h-auto px-[5px] lg:hidden flex col-start-3 col-end-4"
          )}
          onClick={() => setNavOpen(true)}
        >
          {!navOpen && <Menu className="h-[30px] w-[30px]" />}
        </Button>

        <div
          className={cn(
            `flex justify-center items-center gap-8 text-[1.2rem] z-[2]`,
            {
              "hidden lg:flex ": !navOpen,
            },
            {
              "flex-col fixed top-[0] pt-[90px] left-0 right-0 bottom-0 bg-greyBg":
                navOpen,
            }
          )}
        >
          {navOpen && (
            <>
            {/* Close Icon */}
              <Button
                onClick={() => setNavOpen(false)}
                variant={"ghost"}
                className="fixed top-3 right-3"
              >
                <X className="h-[25px] w-[25px]" />
              </Button>
              {/* Home Link */}
              <Link
                className="block lg:hidden text-black no-underline hover:text-primaryHue text-nowrap"
                href={"/"}
              >
                Home
              </Link>
            </>
          )}
          {/* Links */}
          {links.map((link) => (
            <Link
              className="text-black no-underline hover:text-primaryHue text-nowrap"
              href={link.url}
              target="_blank"
              key={link.url}
            >
              {link.route}
            </Link>
          ))}

          {/* Login Button on Mobile Screen */}
          <Button
            asChild
            variant={"ghost"}
            className="flex lg:hidden bg-transparent px-[20px] hover:bg-primaryHue border-primaryHue border-[2px] text-base text-primaryHue hover:text-white duration-200 ease-in-out h-auto"
          >
            <Link href={"/login"}>Login</Link>
          </Button>
        </div>
        
        <Button
          asChild
          variant={"ghost"}
          className="hidden lg:block bg-transparent px-[20px] hover:bg-primaryHue border-primaryHue border-[2px] text-base text-primaryHue hover:text-white duration-200 ease-in-out h-auto col-start-3 col-end-4"
        >
          <Link href={"/login"}>Login</Link>
        </Button>
      </Container>
    </nav>
  );
}

export default PublicHeader;
