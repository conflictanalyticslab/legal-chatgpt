import React from "react";
import QATile from "./components/QATile";
import {
  Accessibility,
  DatabaseZap,
  GlobeLock,
  HandCoins,
  Headset,
  MessageCircleQuestion,
  Scale,
} from "lucide-react";
import "./faq.css";
export default function page() {
  return (
    <div id="faq" className="flex flex-col items-center mx-auto mt-[100px]">
      <div className="flex flex-col gap-5 pb-[100px]">
        <div className="flex flex-col items-center px-[30px] text-center">
          <h1 className="text-[2rem] font-bold">Frequently Asked Questions</h1>
          <label className="font-normal w-full">
            Quick answers to questions you may have.
          </label>
        </div>
        <div className="font-bold flex flex-col gap-[40px] max-w-[1000px] w-[100vw] px-[30px]">
          {/* General Information */}
          <div className="grid">
            <h2>General Information</h2>
            <QATile
              icon={<MessageCircleQuestion />}
              question="What exactly is OpenJustice and what does it aim to achieve?"
            >
              <div>
                <p className="font-normal">
                  OpenJustice is an open-access generative AI fine-tuned for
                  legal applications. It is built on existing Artificial General
                  Intelligence solutions, including OpenAI’s GPT-4o and Meta’s
                  LLaMA, trained on a proprietary legal dataset collected by the
                  Conflict Analytics Lab at Queen’s University. OpenJustice will
                  continue to evaluate models on internal benchmarks and use
                  state-of-the-art foundation models as they are released.
                </p>
                <br />
                <p>
                  OpenJustice aims to become a source for legal help by
                  providing users with legal information, guidance on navigating
                  the legal system, and helping users prepare legal documents,
                  including both litigation documents and contracts. Through an
                  open-access collaboration, OpenJustice seeks to address the
                  core issues with generative AI related to hallucinations and
                  legal reasoning
                </p>
              </div>
            </QATile>
            <QATile
              icon={<MessageCircleQuestion />}
              question="Who is the intended user base for OpenJustice?"
            >
              <p>
                At the moment, OpenJustice is only available to legal
                professionals, law students, and academics. We are testing
                OpenJustice in a variety of different areas of law, and are
                making efforts in reducing errors produced by our system as
                identified by subject matter experts.
              </p>
            </QATile>
            <QATile
              icon={<MessageCircleQuestion />}
              question="How can individuals and law firms contribute to or become a part of the OpenJustice community?"
            >
              <div>
                <p>
                  Legal practitioners can assist with OpenJustice through
                  various means, namely:
                </p>
                <br />
                <ol>
                  <li>
                    <span>(1)</span>
                    <span>
                      <b>Usage:</b>
                      Legal practitioners can contribute to OpenJustice by
                      actively engaging with the platform and correcting any
                      incorrect legal information or analysis by conversating
                      with the chatbot.
                    </span>
                  </li>
                  <li>
                    <span>(2)</span>
                    <span>
                      <b>Research Collaborations:</b> The Conflict Analytics Lab
                      is seeking interested firms and solo practitioners to work
                      with our students to test OpenJustice in a simulated
                      environment. Through the Legal AI Clinic at the Faculty of
                      Law at Queen’s University, we will connect our law
                      students to assist with your legal research using
                      OpenJustice. As our students help you with your work, they
                      will actively evaluate OpenJustice’s performance.
                    </span>
                  </li>
                  <li>
                    <span>(3)</span>
                    <span>
                      <b>Customization Platform:</b> Firms with proprietary
                      legal data may contact our team to create a customized
                      version of OpenJustice trained on your legal data. Your
                      data will not be accessible by users outside your
                      organization, and we will use the interactions with the
                      tool to further fine-tune the open-access version of
                      OpenJustice.
                    </span>
                  </li>
                </ol>
              </div>
            </QATile>
            <label className="font-normal text-center mt-5 text-sm">
              To inquire about research collaborations or creating a customized
              platform for your organization, please email our Program Manager,
              David Liang at{" "}
              <a href={"mailto:david.liang@queensu.ca"}>
                david.liang@queensu.ca
              </a>
            </label>
          </div>

          {/* Usage and Accessibility */}
          <div className="grid ">
            <h2>Usage and Accessibility</h2>
            <QATile
              icon={<Accessibility />}
              question="How does OpenJustice process and respond to legal queries?"
            >
              <p className="font-normal">
                Openjustice processes queries by passing legal queries through
                our generative language model which is built upon foundation
                models. Combined with a retrieval engine which operates on a
                legal database, the output of OpenJustice is generated through a
                Retrieval Augmented Generation (RAG) strategy.
              </p>
            </QATile>
            <QATile
              icon={<Accessibility />}
              question="What categories of legal questions is OpenJustice equipped to handle?"
            >
              <p>
                OpenJustice is equipped to handle all types of legal questions.
                However, the accuracy of the answers will vary depending on the
                practice area, jurisdiction, and the complexity of the legal
                questions.
              </p>
            </QATile>
            <QATile
              icon={<Accessibility />}
              question="What are the steps to get started and make the most out of OpenJustice?"
            >
              <div>
                <p>
                  It is important to understand create effective prompts for
                  OpenJustice. Here are some suggestions:
                </p>
                <ol>
                  <li>
                    <span>(i)</span>
                    <span>
                      <b>Assign a Task:</b> Create a clear, specific, series of
                      actions that you wish the LLM to perform. For example:
                      “Prepare a memorandum of law based on the following
                      facts….”
                    </span>
                  </li>
                  <li>
                    <span>(ii)</span>
                    <span>
                      <b>Assign a Role:</b> Include the perspective that the LLM
                      should take by focusing on: Personality, Tone, Expertise,
                      and/or Background. For example: “You are a corporate
                      lawyer in Toronto preparing a memorandum on…. in a
                      professional tone and in plain English for your
                      supervising lawyer.”
                    </span>
                  </li>
                  <li>
                    <span>(iii)</span>
                    <span>
                      <b>Provide Context:</b> Furnish all relevant details
                      related to the desired outcome, including factual
                      information and areas of law. For example: “The facts of
                      the case are…. Based on the facts presented, provide 3
                      possible counterarguments to the claim.”
                    </span>
                  </li>
                  <li>
                    <span>(iv)</span>
                    <span>
                      <b>Create a Structure for the Response:</b> Provide
                      details related to the structure of your desired output,
                      such as the structure and contents that should be
                      included. The structure can be limited by word count,
                      format, and the order of information presented. The
                      contents can be limited by the type of document you wish
                      to produce. For example, you can input a prompt for the
                      LLM to follow the CREAC/IRAC framework for the purposes of
                      a legal memo.
                    </span>
                  </li>
                  <li>
                    <span>(v)</span>
                    <span>
                      <b>Refine (Very Important):</b> Further engage with the AI
                      to elaborate, refine, verify, and/or evaluate the
                      generated response. In most AIs, you can reference the
                      generated response in via a new command prompt. For
                      example: “Rewrite the above memo in plain English and
                      reduce the use of modifiers,” or “reanalyze the above
                      step-by-step”
                    </span>
                  </li>
                </ol>
              </div>
            </QATile>
            <QATile
              icon={<Accessibility />}
              question="Can OpenJustice be utilised for academic and research purposes?"
            >
              <p>
                Yes. However, as with any generative AI tool, the responses from
                OpenJustice should be thoroughly vetted before being utilized.
              </p>
            </QATile>
            <QATile
              icon={<Accessibility />}
              question="Is OpenJustice accessible on mobile devices?"
            >
              <p>
                No. At the moment, OpenJustice is only equipped to handle
                queries through a computer device. Users are recommended to
                access OpenJustice through Google Chrome to minimize any issues
                interacting with the platform.
              </p>
            </QATile>
          </div>

          {/* Legal and Professional Aspects */}
          <div className="grid">
            <h2>Legal and Professional Aspects</h2>
            <QATile
              icon={<Scale />}
              question="Does OpenJustice offer legal advice or guidance?"
            >
              <p className="font-normal">
                OpenJustice is not intended to be substituted as legal advice.
                Users are encouraged to use OpenJustice as a starting point for
                their legal work, however they should take caution and verify
                the contents of the response through their own research.
              </p>
            </QATile>
            <QATile
              icon={<Scale />}
              question="Is OpenJustice capable of assisting in the creation of legal documents?"
            >
              <div>
                <p>
                  Yes, OpenJustice is able to create legal documents. Simply
                  enter the type of legal document you wish to create and
                  provide context regarding the structure of the document.
                </p>
                <br />
                <p>
                  However, users are discouraged from entering any personal and
                  confidential information in the prompt. Instead, users should
                  copy the generated template to a separate local document and
                  enter any personal and confidential details offline.
                </p>
              </div>
            </QATile>
            <QATile
              icon={<Scale />}
              question="How does OpenJustice handle legal queries from different jurisdictions and legal systems?"
            >
              <p>
                OpenJustice requires users to enter their specific jurisdiction
                in the prompt in order to answer legal questions tailored to
                your jurisdiction. Currently, we are collaborating with research
                teams in Canada, US, and EU to handle legal queries in each
                jurisdiction.
              </p>
            </QATile>
          </div>

          {/* Technical and Language Support */}
          <div className="grid">
            <h2>Technical and Language Support</h2>
            <QATile
              icon={<Headset />}
              question="Which languages are supported by OpenJustice?"
            >
              <p className="font-normal">
                OpenJustice is currently supported for the english language.
                However, since the foundation models have multilingual
                properties, the performance may be acceptable in other
                languages. Our team is dedicating efforts to expand OpenJustice
                in French and Spanish, with plans for more languages in the
                future. ￼
              </p>
            </QATile>
            <QATile
              icon={<Headset />}
              question="Is the information provided by OpenJustice regularly updated?"
            >
              <p>
                As the nature of the feedback system goes, the information
                provided by OpenJustice will be up-to-date especially if queries
                are made in popular legal topics and densely populated
                jurisdictions. For rarer cases, our team is making efforts to
                improve the information provided by OpenJustice.
              </p>
            </QATile>
          </div>

          {/* Data Privacy and Governance */}
          <div className="grid">
            <h2>Data Privacy and Governance</h2>
            <QATile
              icon={<GlobeLock />}
              question="What privacy considerations should students be mindful of when interacting with OpenJustice?"
            >
              <p className="font-normal">
                As with any generative AI system, proprietary information such
                as a person’s name, address, and other identifiable artifacts
                should be removed. Nonetheless, OpenJustice does have a
                filtering system to ensure that this information is never
                processed through our language model.
              </p>
            </QATile>
            <QATile
              icon={<GlobeLock />}
              question="What kind of data is collected as users interact with OpenJustice, and how is it used?"
            >
              <p>
                Feedback for natural legal queries, retrieval engine clicks, and
                user-feedback on quality of responses is collected to improve
                OpenJustice.
              </p>
            </QATile>
            <QATile
              icon={<GlobeLock />}
              question="How does OpenJustice vet and ensure the integrity and quality of its dataset?"
            >
              <p>
                By controlling the users that have access to OpenJustice, we
                maintain a high standard for input data. Outliers can be
                identified through our data processing pipeline.
              </p>
            </QATile>
            <QATile
              icon={<GlobeLock />}
              question="What protocols are followed to secure the data and protect it from unauthorised access?"
            >
              <p>
                Specifically for partners, we are utilizing on-premise machines
                which are inaccessible from the internet to protect uploaded
                data. Models are also only local for these specific machines.
              </p>
            </QATile>
          </div>

          {/* Feedback and Support */}
          <div className="grid">
            <h2>Feedback and Support</h2>
            <QATile
              icon={<GlobeLock />}
              question="How can users provide their feedback or report any issues they encounter with OpenJustice?"
            >
              <div>
                <p className="font-normal">
                  Users can evaluate each response through the feedback function
                  located on the right-hand side of each response generated by
                  OpenJustice. Users can click the Thumbs Up or Thumbs Down
                  button and provide additional context into the platform.
                </p>
              </div>
            </QATile>
          </div>

          {/* Financial Aspects */}
          <div className="grid">
            <h2>Financial Aspects</h2>
            <QATile
              icon={<HandCoins />}
              question="Is there any cost associated with using OpenJustice?"
            >
              <div>
                <p>
                  No, OpenJustice is free and is funded by public grants.
                  However, due to the costs associated with OpenJustice, users
                  will have daily limits to the number of prompts allowed.
                </p>
                <br />
                <p>
                  If your organization is interested in obtaining expanded
                  prompt limits, contact our team to discuss your options.
                </p>
              </div>
            </QATile>
          </div>

          {/* Dataset and Training */}
          <div className="grid">
            <h2>Financial Aspects</h2>
            <QATile
              icon={<DatabaseZap />}
              question="Does OpenJustice’s dataset cover a wide range of jurisdictions or is it limited?"
            >
              <p>
                Our partners are spread across Canada, US, and EU. We have plans
                to expand to other jurisdictions.
              </p>
            </QATile>
            <QATile
              icon={<DatabaseZap />}
              question="Is OpenJustice designed to expand its dataset by accepting document uploads?"
            >
              <p>Yes.</p>
            </QATile>
            <QATile
              icon={<DatabaseZap />}
              question="How does OpenJustice handle outdated or incorrect information in its dataset?"
            >
              <p>
                By recent queries being made on the same topic by our large
                highly-qualified legal community.
              </p>
            </QATile>
          </div>
        </div>
      </div>
    </div>
  );
}
