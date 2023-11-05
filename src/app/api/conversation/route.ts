import { generatePromptFromDocuments } from "@/util/api/generatePromptFromDocuments";
import { getDocumentText } from "@/util/api/getDocuments";
import { authenticateApiUser } from "@/util/api/middleware/authenticateApiUser";
import { loadUser } from "@/util/api/middleware/loadUser";
import { queryOpenAi } from "@/util/api/queryOpenAi";
import { SearchResult, callSearchAPI } from "@/util/api/runSearch";
import { searchAndSummarize } from "@/util/api/searchAndSummarize";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
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
    const firstReplyRes = await queryOpenAi({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "Answer in 500 words or less. Short answers are better.\n\n" +
            documentPrompt,
        },
        ...fullConversation,
      ],
    });

    const firstReplyContent = firstReplyRes.choices[0].message.content;
    console.log("Logging response from OpenAi", firstReplyRes);

    const {searchResults, toSearch} = await searchAndSummarize(firstReplyContent);

    // console.log("Search Results", searchResults);

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

      const secondReplyRes = await queryOpenAi({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "Answer in 500 words or less. Short answers are better.\n\n" +
              documentPrompt +
              "\n\n" +
              searchPrompt,
          },
          ...fullConversation,
        ],
      });

      console.log("Logging second response from OpenAi", secondReplyRes);

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