import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import PageHeaderDescription from "@/components/ui/page-description";
import PageTitle from "@/components/ui/page-title";
import PageSubtitle from "@/components/ui/page-subtitle";
import Container from "@/components/ui/Container";
import DemoVideo from "@/components/demo-video/demo-video";
import PublicFooter from "@/components/publicShell/public-footer";
import SlidingPartners from "@/components/partners/sliding-partners";
import { TwoPartners } from "@/components/partners/two-partners";

export default function Page() {
  return (
    <main id="main-id" className="pt-10">
      <Container
        id="landing-page"
        className="min-h-[100vh] sm:min-h-[100vh] pb-[70px] flex items-center gap-5 justify-center"
      >
        <div className="flex flex-col lg:flex-row justify-between gap-10 relative mb-[10vh]">
          {/* Info */}
          <section className="flex flex-col items-start justify-start w-full sm:max-w-[85%] lg:max-w-[55%] relative gap-6 xl:gap-8">
            {/* Title Heading */}
            <PageTitle>
              Generative AI <br /> Designed for Law
            </PageTitle>

            {/* Description */}
            <div className="flex flex-col gap-2 text-[--grey] text-left">
              <PageHeaderDescription>
                We aim to deliver reliable legal AI. OpenJustice uses advanced
                language models to process legal queries and documents,
                providing accurate answers and tools for students and lawyers.
                Your feedback helps us improve its dependability.
              </PageHeaderDescription>
              <PageHeaderDescription className="font-bold text-primaryHue">
                OpenJustice is open to all lawyers and legal professionals with
                an institutional email.
              </PageHeaderDescription>
            </div>

            <Button
              variant="default"
              className="self-start w-[150px] bg-primaryHue hover:bg-primaryHue/90 text-white"
              asChild
            >
              <Link href="/login">Get Started</Link>
            </Button>
          </section>
          {/* Chat Page Video */}
          <DemoVideo />
        </div>
      </Container>

      <div className="w-full bg-[#193a63] text-white border-solid border-[1px] py-4 shadow-lg">
        <Container className="flex flex-col items-center gap-3">
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
          <PageSubtitle className="text-[#11335D] text-center font-bold leading-tight">
            So far, the Conflict Analytics Lab has partnered up with 15+
            organizations across the Americas, Europe, and Asia-Pacific to
            create an open-access solution for the legal profession.
          </PageSubtitle>
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
        className="bg-[white] w-[100%] min-h-[100vh] flex flex-col gap-[30px] items-center justify-center relative "
      >
        <Container className="text-center flex flex-col items-center gap-[15px] pt-[100px] my-0">
          <h1 className="text-5xl font-bold">OpenJustice Demo</h1>
          <p className="text-xl text-[#646464]">
            Watch our demo and learn more about OpenJustice.
          </p>
        </Container>
        <div className=" flex min-h-[300px] sm:min-h-[400px] md:min-h-[400px] lg:min-h-[600px] mx-auto mb-[150px]">
          <iframe
            src="https://www.youtube.com/embed/pmF9FYCWT5A?rel=0"
            className=" max-w-[1000px] w-[90vw] sm:w-[80vw] lg:w-[70vw] rounded-lg shadow-lg"
            scrolling="no"
            title="Conflict Analytics OpenJustice Demo FINAL.mp4"
          ></iframe>
        </div>
      </div>

    </main>
  );
}
