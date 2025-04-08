import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import PageHeaderDescription from "@/components/ui/page-description";
import PageTitle from "@/components/ui/page-title";
import PageSubtitle from "@/components/ui/page-subtitle";
import Container from "@/components/ui/Container";
import DemoVideo from "@/components/demo-video/demo-video";
import SlidingPartners from "@/components/partners/sliding-partners";
import { TwoPartners } from "@/components/partners/two-partners";
import { ExternalLink } from "lucide-react";

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
              OpenJustice:
              <br />
              No-Code Legal AI Creation Platform
            </PageTitle>

            {/* Description */}
            <div className="flex flex-col gap-2 text-[--grey] text-left">
              <PageHeaderDescription>
                OpenJustice is an open-source platform designed to enable legal
                professionals to effortlessly create and deploy customized AI
                models using plain language. Our mission aims to democratize
                access to artificial intelligence for the legal profession,
                enhancing accessibility, transparency and reliability of AI for
                legal applications.
              </PageHeaderDescription>
              <PageHeaderDescription className="font-bold">
                Key Features:
              </PageHeaderDescription>
              <div>
                <ul className="list-disc list-inside">
                  <li className="text-[--grey] text-base xl:text-lg">
                    <b>No-Code AI Development:</b> Build and refine AI models to
                    tackle real-world legal tasks without requiring coding
                    expertise.
                  </li>
                  <li className="text-[--grey] text-base xl:text-lg">
                    <b>Community-Driven Data:</b> Access a collaborative
                    database of crowd-sourced legal resources, contributed and
                    validated by subject matter experts across the globe.
                  </li>
                </ul>
              </div>
              <PageHeaderDescription className="font-bold">
                Designed for Legal and Compliance Professionals:
              </PageHeaderDescription>
              <PageHeaderDescription>
                OpenJustice is tailored for legal professionals, researchers,
                academic institutions, and legal educators, providing an
                intuitive, no code platform to embed legal knowledge into AI
                models and create AI solutions for legal research, education,
                and practice.
              </PageHeaderDescription>
              <PageHeaderDescription className="font-bold">
                Collaboration and Partnership
              </PageHeaderDescription>
              <PageHeaderDescription>
                The platform supports collaboration among a global network of
                legal experts and institutions, including partnerships with
                academic institutions and legal industry leaders engaged in
                advancing AI research and its practical application within the
                legal field.
              </PageHeaderDescription>
              <PageHeaderDescription className="font-bold">
                Get Started
              </PageHeaderDescription>
              Legal professionals and academics are invited to join and
              contribute to the OpenJustice community, facilitating the growth
              of and access to AI resources within the legal field.
              <PageHeaderDescription className="font-bold text-primaryHue">
                OpenJustice is open to all lawyers and legal professionals with
                an institutional email. Sign up now to be part of shaping the
                future of legal technology.
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

      <div className="w-full bg-[#193a63] text-white py-4">
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

      <div className="w-full bg-[#5865F2] text-white py-4">
        <Container className="flex justify-between items-center gap-3">
          <div className="flex items-center gap-4">
            <img src="/assets/logos/discord-white.svg" className="h-[50px]" />
            <span className="text-xl font-bold text-white">
              Join our community
            </span>
          </div>

          <Button className="bg-white text-[#5865F2] hover:bg-gray-100" asChild>
            <a
              href="https://discord.gg/ykxbDAD5"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>Join Discord</span>
              <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
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
            src="https://www.youtube.com/watch?v=Mc14ei6I0yk"
            className=" max-w-[1000px] w-[90vw] sm:w-[80vw] lg:w-[70vw] rounded-lg shadow-lg"
            title="Conflict Analytics OpenJustice Demo.mp4"
          ></iframe>
        </div>
      </div>
    </main>
  );
}
