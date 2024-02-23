import React from "react";
import Image from "next/image";
import { Grid, Typography, Box } from "@mui/material";
import mid_logo from "@/images/OpenMiddleLogo.png";
import leftRight from "@/images/LandingBackground.png";
import { PublicShell } from "@/components/PublicShell/PublicShell";
import { AppBackground, GridContainer, HeroBox } from "@/styles/styles";
import Container from "@/components/ui/Container";
import { Button } from "@/components/ui/button";
import Link from "next/link";
// import MainpageVid from "@/images/MainPageVid.mp4";

export default function Home() {
  return (
    <PublicShell>
      <Hero />
    </PublicShell>
  );
}

function Hero() {
  return (
    <main className="  ">
      <Container className="min-h-[100vh] py-[70px] flex flex-col justify-center ">
        {/* Info */}
        <div className="flex flex-col lg:flex-row items-center justify-between w-[100%] h-[100%] lg:gap-[60px] pt-[60px] lg:pt-[0]">
          <div className="flex flex-col  items-center lg:items-start gap-[35px] lg:gap-[15px] w-[100%] md:w-[80%] lg:w-[65%] order-2 lg:order-1 ">
            {/* Title Heading */}
            <div className="flex flex-col gap-[5px]">
              <h1 className="text-5xl font-bold text-center lg:text-left">
                Generative AI <br className="block lg:hidden" /> Designed for
                Law
              </h1>
              <div className="flex flex-wrap gap-x-[15px] justify-center lg:justify-start">
                <p className="text-xl"> Expert-led </p>
                <p className="text-xl"> Non-Profit </p>
                <p className="text-xl"> Open-source</p>
                <p className="text-xl"> Independent </p>
              </div>
            </div>
            {/* Description */}
            <div className="flex flex-col gap-[30px] items-center lg:items-start">
              <p className="text-xl text-[#646464] text-center lg:text-left">
                Our goal is to deliver accessible, reliable legal AI.
                OpenJustice, built on advanced language models for law,
                processes queries and documents, drawing from vast legal sources
                to provide precise, comprehensive answers and innovative tools
                for law students and lawyers. As a growing prototype, we value
                your feedback to improve and ensure OpenJustice's dependability.
              </p>
              <Button
                variant="default"
                className="w-[150px] bg-primaryOJ hover:bg-primaryOJ/90 text-white"
              >
                <Link href="/login">Get Started</Link>
              </Button>
            </div>
          </div>

          {/* LOGO */}
          <div className="order-1 min-w-[150px] lg:min-w-[300px] min-h-[150px] lg:min-h-[300px] max-h-[150px] lg:max-h-[300px] max-w-[150px] lg:max-w-[300px] relative">
            <Image
              src={"/assets/landing_page/OJ_ICON.svg"}
              fill
              alt="ICON"
              className="object-contain"
            />
          </div>
        </div>
      </Container>
      <div className="bg-[white] w-[100%] pt-[50px] pb-[100px] flex flex-col gap-[30px] items-center ">
        <Container className="text-center flex flex-col items-center gap-[15px]">
          <h1 className="text-5xl font-bold">OpenJustice Demo</h1>
          <p className="text-xl text-[#646464]">
            {" "}
            Watch our demo and learn more about OpenJustice.
          </p>
        </Container>
        <div className=" video-shadow flex min-h-[400px] mx-auto">
          <iframe
            src="https://www.youtube.com/embed/pmF9FYCWT5A?rel=0"
            className=" max-w-[1000px] w-[90vw] sm:w-[80vw] lg:w-[70vw] h-[100vh] max-h-[400px] md:max-h-[500px] lg:max-h-[600px]"
            scrolling="no"
            title="Conflict Analytics OpenJustice Demo FINAL.mp4"
          ></iframe>
        </div>
      </div>
    </main>
  );
}
