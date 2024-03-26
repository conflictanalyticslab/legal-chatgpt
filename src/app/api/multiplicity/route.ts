import { authenticateApiUser } from "@/util/api/middleware/authenticateApiUser";
import { loadUser } from "@/util/api/middleware/loadUser";
import { queryOpenAi } from "@/util/api/queryOpenAi";
import queryLlama2 from "@/util/api/queryLlama2";
import { NextResponse } from "next/server";
import { getDocumentText } from "@/util/api/getDocuments";
import { generatePromptFromDocuments } from "@/util/api/generatePromptFromDocuments";
import { searchAndSummarize } from "@/util/api/searchAndSummarize";

export async function POST(req: Request) {
  console.log("made it to multiplicity");
  const { earlyResponse, decodedToken } = await authenticateApiUser();
  if (earlyResponse) {
    return earlyResponse;
  }

  if (!decodedToken) {
    return NextResponse.json(
      { error: "decodedToken is missing but there was no earlyResponse" },
      { status: 500 }
    );
  }

  const { fullConversation, includedDocuments } = await req.json();
  if (fullConversation.length === 0) {
    return NextResponse.json(
      { error: "fullConversation is empty" },
      { status: 400 }
    );
  }

  const { user, userRef } = await loadUser(decodedToken);
  const documents = await getDocumentText(includedDocuments);
  const documentPrompt = generatePromptFromDocuments(documents);

  if (user && user.prompts_left > 0) {
    await userRef.update({ prompts_left: user.prompts_left - 1 });
    let firstReplyRes: any;
    let gpt_flag = true;
    try {
    firstReplyRes = await queryOpenAi({
      model: "gpt-3.5-turbo-0125",
      messages: [
        {
          role: "system",
          // content: "Answer in 500 words or less. Short answers are better." 
          content: "If the question does not encompass different scenarios, ignore the rest of the prompt. Else if your answer encompasses different scenarios, number the new scenario and go to a new line. Give an answer that covers a few scenarios that the question encompasses." + documentPrompt,
        },
        ...fullConversation,
      ],
    });
    if (!firstReplyRes || !firstReplyRes.choices || firstReplyRes.choices.length === 0) {
      gpt_flag = false;
    }
    } catch (error) {
      console.error("queryOpenAi failed: " + error);
      gpt_flag = false;
    }

    if (!gpt_flag)  {
      console.error("Error from OpenAI: " + firstReplyRes);
      console.log("switching to llama2 in multiplicity/route.ts for first response");

      // set a 1 second time out between llama2 requests for stability
      try {
        firstReplyRes = await queryLlama2({
          "messages": [
            {
              "role": "system",
              // content: "Answer in 500 words or less. Short answers are better." 
              "content": "If the question does not encompass different scenarios, ignore the rest of the prompt. Else if your answer encompasses different scenarios, number the new scenario and go to a new line. Give an answer that covers a few scenarios that the question encompasses." + documentPrompt,
            },
            ...fullConversation,
          ],
        });
        console.log("Logging response from llama2", firstReplyRes.choices[0].message.content);
      } catch (error) {
        console.error("queryLlama2 failed in multiplicity/route.ts for first response: " + error);
      }
    };

    // console.log("made it past llama2, " + firstReplyRes.choices[0].message.content)
    const firstReplyContent = firstReplyRes.choices[0].message.content;
    console.log("made it past response acuisition");

    
    const {searchResults, toSearch} = await searchAndSummarize(firstReplyContent);

    // See api/conversation/route.ts for how to run a search with runSearch()
    if (Array.isArray(searchResults) && searchResults.length > 0) {
      // const searchPrompt = searchResults
      //   .map(
      //     (result: SearchResult) =>
      //       "Document title: " +
      //       result.title +
      //       "\n\nAbstract: " +
      //       result.abstract
      //   )
      //   .join("\n\n");

      // The chat context is too short when we include all the results. Revisit this when using a larger model.
      // Can use tokenLength() to estimate the tokens used so far.
      const searchPrompt = searchResults[0].abstract;

      let secondReplyRes: any;
      gpt_flag = true;

      try {
        secondReplyRes = await queryOpenAi({
          model: "gpt-3.5-turbo-0125",
          messages: [
            {
              role: "system",
              content:
                "If the question does not encompass different scenarios, ignore the rest of the prompt. Else if your answer encompasses different scenarios, number the new scenario and go to a new line. Give an answer that covers a few scenarios that the question encompasses. Use bolded fonts to highlight keywords and scenario headings.\n" +
                documentPrompt +
                "\n\n" +
                searchPrompt,
            },
            ...fullConversation,
          ],
        });
        if (!secondReplyRes || !secondReplyRes.choices || secondReplyRes.choices.length === 0) {
          gpt_flag = false;
        }
      } catch (error) {
        console.error("second response queryOpenAi failed: " + error);
        gpt_flag = false;
      }

      if (!gpt_flag) {
        console.log("switching to llama2 in multiplicity/route.ts for second response");

        try {
          secondReplyRes = await queryLlama2({
            "messages": [
              {
                "role": "system",
                // content: "Answer in 500 words or less. Short answers are better." 
                "content":
                "If the question does not encompass different scenarios, ignore the rest of the prompt. Else if your answer encompasses different scenarios, number the new scenario and go to a new line. Give an answer that covers a few scenarios that the question encompasses.\n" +
                documentPrompt +
                "\n\n" +
                searchPrompt,
              },
              ...fullConversation,
            ],
          });
          console.log("Logging second response from llama2", secondReplyRes.choices[0].message.content);
        } catch (error) {
          console.error("queryLlama2 failed in multiplicity/route.ts for second response: " + error);
        }
      }


      console.log("Logging second response", secondReplyRes);

      return NextResponse.json({
        latestBotResponse: secondReplyRes.choices[0].message.content,
        toSearch: toSearch
      });
    } else {
      return NextResponse.json({
        latestBotResponse: firstReplyContent,
        toSearch: toSearch
      });
    }
  }

  return NextResponse.json({ error: "No prompts left" }, { status: 403 });
}
