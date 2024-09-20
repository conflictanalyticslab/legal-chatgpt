import React from "react";
import Image from "next/image";
import { PublicShell } from "@/components/PublicShell/PublicShell";
import Container from "@/components/ui/Container";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { TwoPartners } from "@/components/Partners/TwoPartners";
import SlidingPartners from "@/components/Partners/SlidingPartners";
import PublicFooter from "@/components/PublicShell/PublicFooter";
import { Lightbulb, Map } from "lucide-react";

export default function Home() {
  return (
    <PublicShell showFooter={false}>
      <Hero />
    </PublicShell>
  );
}

function Hero() {
  return (
    <main id="main-id">
      <Container
        id="landing-page"
        className="landing-page min-h-[100vh] sm:min-h-[100dvh] pb-[70px] flex flex-col justify-center xl:justify-center "
      >
        {/* Info */}
        <div className="flex flex-col lg:grid gap-5 grid-cols-[1fr_auto] lg:flex-row items-center justify-between w-[100%] h-[100%] lg:gap-[60px] pt-[10px] lg:pt-[0]">
          <div className="flex flex-col items-start gap-[5px] sm:gap-[35px] lg:gap-[15px] w-full order-2 lg:order-1 ">
            {/* Title Heading */}
            <div className="flex flex-col gap-[5px] w-full">
              <h1 className="text-[2rem] sm:text-[2.2rem] md:text-[2.6rem] lg:text-5xl font-bold text-left w-full leading-tight">
                Generative AI Designed for Law
              </h1>
              <div className="flex flex-wrap gap-x-[15px] justify-start pl-1">
                <p className="text-sm sm:text-xl font-normal"> Expert-led </p>
                <p className="text-sm sm:text-xl font-normal"> Non-Profit </p>
                <p className="text-sm sm:text-xl font-normal"> Open-Access</p>
                <p className="text-sm sm:text-xl font-normal"> Independent </p>
              </div>
            </div>
            {/* Description */}
            <div className="flex flex-col gap-[30px] items-center lg:items-start pl-1">
              <div className=" text-sm sm:text-xl text-[--grey] text-left max-w-[900px]">
                <p>
                  We aim to deliver reliable legal AI. OpenJustice uses advanced
                  language models to process legal queries and documents,
                  providing accurate answers and tools for students and lawyers.
                  Your feedback helps us improve its dependability.
                </p>
                <p className="font-normal text-primaryOJ mt-4">
                  OpenJustice is open to all lawyers and legal professionals
                  with an institutional email.
                </p>
              </div>
              <Button
                variant="default"
                className="self-start w-[150px] bg-primaryOJ hover:bg-primaryOJ/90 text-white text-md md:text-lg py-[1.2rem] lg:py-[1.4rem]"
                asChild
              >
                <Link href="/login">Get Started</Link>
              </Button>
            </div>
          </div>

          {/* LOGO */}
          <div className="order-1 justify-start items-center hidden lg:flex">
            <Image
              src={"/assets/icons/oj-icon.svg"}
              width={200}
              height={200}
              alt="ICON"
              className="object-contain"
            />
          </div>
        </div>
      </Container>

      <div className="w-full bg-[#193a63] text-white border-solid border-[1px] py-4 shadow-lg">
        <Container className="flex flex-col items-center gap-3">
          {/* <Map className="w-7 h-7" /> */}
          <p className="text-center">
            OpenJustice is currently trained on legal data for the US and Canada
            (with limited coverage). We are working on expanding our coverage to
            include legal data from the EU, France, and select Australian
            jurisdictions. Additionally, we are working on integrating
            International Law, particularly for civil service matters.
          </p>
        </Container>
      </div>

      {/* Partners Page */}
      <div className="bg-white py-[50px] md:py-0 md:min-h-[446px] flex items-center ">
        <Container>
          <h1 className="text-[1.2rem] sm:text-[1.7rem] md:text-[2rem] lg:text-[length:--subheading] text-[#11335D] text-center font-bold leading-tight">
            So far, the Conflict Analytics Lab has partnered up with 15+
            organizations across the Americas, Europe, and Asia-Pacific to
            create an open-access solution for the legal profession.
          </h1>
        </Container>
      </div>

      <TwoPartners
        title="Industry Partners"
        description="The Conflict Analytics Lab partners with private sector leaders,
        harnessing the power of AI research to transform the practice of law.
        By advancing AI capabilities, the lab aims to revolutionize how legal
        tasks are conducted and enhance dispute resolution processes."
        textLeft={false}
        partners={[
          {
            url: "/assets/partners/industry/odr.png",
            width: "w-[100%]",
            height: "h-[63px]",
          },
          {
            url: "/assets/partners/industry/legal_by_design.png",
            width: "w-[100%]",
            height: "h-[80px] lg:h-[105px]",
          },
        ]}
      />

      <SlidingPartners
        className="overflow-x-hidden"
        title="Academic Partners"
        description="We work alongside top academic institutions worldwide, conducting cutting-edge research on the mechanization of legal reasoning and ethical design of legal AIs. Through our collaborative research, we aim to set new standards for  transparency and fairness in legal technology development."
      />

      <TwoPartners
        title="Non-Profit Partners"
        description="Partnering with non-profit legal  organizations, the Conflict Analytics Lab advances AI research for social impact and economic benefits for the broader public."
        textLeft={true}
        partners={[
          {
            url: "/assets/partners/non-profit/pro-bono.png",
            width: "w-[100%]",
            height: "h-[92px]",
          },
          {
            url: "/assets/partners/non-profit/legal-clinic.png",
            width: "w-[100%]",
            height: "h-[120px]",
          },
        ]}
      />

      {/* Video  */}
      <div
        id="video-page"
        className="bg-[white] w-[100%] min-h-[100dvh] flex flex-col gap-[30px] items-center justify-center relative "
      >
        <Container className="text-center flex flex-col items-center gap-[15px] pt-[100px] my-0">
          <h1 className="text-5xl font-bold">OpenJustice Demo</h1>
          <p className="text-xl text-[#646464]">
            Watch our demo and learn more about OpenJustice.
          </p>
        </Container>
        <div className=" video-shadow flex min-h-[300px] sm:min-h-[400px] md:min-h-[400px] lg:min-h-[600px] mx-auto mb-[150px]">
          <iframe
            src="https://www.youtube.com/embed/pmF9FYCWT5A?rel=0"
            className=" max-w-[1000px] w-[90vw] sm:w-[80vw] lg:w-[70vw] "
            scrolling="no"
            title="Conflict Analytics OpenJustice Demo FINAL.mp4"
          ></iframe>
        </div>
      </div>

      <PublicFooter />
    </main>
  );
}
