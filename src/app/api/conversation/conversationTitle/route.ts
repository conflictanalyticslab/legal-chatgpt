import {
  getFirestore,
} from "firebase-admin/firestore";
import { generatePromptFromDocuments } from "@/util/api/firebase_utils/generatePromptFromDocuments";
import { getDocumentText } from "@/util/api/firebase_utils/getDocuments";
import { authenticateApiUser } from "@/util/api/middleware/authenticateApiUser";
import { loadUser } from "@/util/api/middleware/loadUser";
import { queryOpenAi } from "@/util/LLM_utils/queryOpenAi";
import queryLlama2 from "@/util/LLM_utils/queryLlama2";
// import { searchAndSummarize } from "@/util/api/searchAndSummarize";
import { NextResponse } from "next/server";

export async function GET(_: Request) {
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

  const queryResults = await getFirestore()
    .collection("conversations")
    .where("userUid", "==", decodedToken.user_id)
    .get();

  const plainJsObjects = queryResults.docs.map((doc) => {
    const data = doc.data();
    return { title: data.title, uid: doc.id };
  });

  return NextResponse.json({ conversations: plainJsObjects }, { status: 200 });
}

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

  const { fullConversation, includedDocuments} = await req.json();
  console.log("\nConversation Title ------>", fullConversation)

  if (fullConversation.length === 0) {
    return NextResponse.json(
      { error: "fullConversation is empty" },
      { status: 400 }
    );
  }

  const { user, userRef } = await loadUser(decodedToken);
  const documents = await getDocumentText(includedDocuments);
  // const queryDocument = includedDocuments.length > 0 ? "Here is a document for context: " : "";

  if (user && user.prompts_left > 0) {
    await userRef.update({ prompts_left: user.prompts_left - 1 });
    let firstReplyRes: any;
    let gpt_flag = true;
    try {
      firstReplyRes = await queryOpenAi({
        model: "gpt-4-turbo-2024-04-09",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant"
          },
          ...fullConversation,
          {
            role: "user",
            content: "give a title to the current conversation."
          }
        ],
      });
      if (!firstReplyRes || !firstReplyRes.choices || firstReplyRes.choices.length === 0) {
        gpt_flag = false;
      }
    } catch (error) {
      console.error("queryOpenAi failed: " + error);
      gpt_flag = false;
    }

    if (!gpt_flag) {
        console.error("Error from OpenAI: " + firstReplyRes);
        console.log("switching to llama2 in conversation/searchTerms/route.ts");

        try {
          firstReplyRes = await queryLlama2({
            messages: [
              {
                role: "system",
                content:
                  "You are a helpful assistant"
              },
              ...fullConversation,
              {
                role: "user",
                content: "give a title to the current conversation."
              }
            ],
          });
          console.log("Logging response from llama2", firstReplyRes.choices[0].message.content);
        } catch (error) {
          console.error("queryLlama2 failed in conversation/searchTerms/route.ts: " + error);
        };
    }

    const conversationTitle = firstReplyRes.choices[0].message.content;
    console.log("Logging response from OpenAi", firstReplyRes.choices[0].message.content);
    // const {searchResults, toSearch} = await searchAndSummarize(firstReplyContent);

    // console.log("Search Results", searchResults);

    // if (Array.isArray(searchResults) && searchResults.length > 0) {
    //   // const searchPrompt = searchResults
    //   //   .map(
    //   //     (result: SearchResult) =>
    //   //       "Document title: " +
    //   //       result.title +
    //   //       "\n\nAbstract: " +
    //   //       result.abstract
    //   //   )
    //   //   .join("\n\n");

    //   // The chat context is too short when we include all the results. Revisit this when using a larger model.
    //   // Can use tokenLength() to estimate the tokens used so far.
    //   return NextResponse.json({toSearch: toSearch, searchPrompt: searchResults[0].abstract, documentPrompt: documentPrompt})
    // }
    return NextResponse.json({title: conversationTitle})
  }
    return NextResponse.json({ error: "User has no prompts left" }, { status: 403 });
};
