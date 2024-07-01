/**
 * @file: route.ts - api/conversation - api route for calling the normal LLM's response
 *
 * @author Kevin Yu <yu.kevin2002@gmail.com>
 * @date Jun 2024
 */

import { authenticateApiUser } from "@/util/api/middleware/authenticateApiUser";
import { loadUser } from "@/util/api/middleware/loadUser";
import { queryOpenAi } from "@/util/LLM_utils/queryOpenAi";
import queryLlama2 from "@/util/LLM_utils/queryLlama2";
import { NextResponse } from "next/server";
import GPT4Tokenizer from 'gpt4-tokenizer';
import { getFirestore } from "firebase-admin/firestore";

/**
 * 
 * @param req 
 * @returns 
 */
export async function GET(req: Request) {
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

  const {title} = await req.json();

  const queryResults = await getFirestore()
    .collection("conversations")
    .where("userUid", "==", decodedToken.user_id)
    .where("title", "==", title)
    .limit(1)
    .get();

  if (queryResults.empty) {
    return NextResponse.json(
      { error: "No matching conversation found" },
      { status: 404 }
    );
  }

  const doc = queryResults.docs[0];
  const data = doc.data();

  return NextResponse.json({ conversation: { ...data, uid: doc.id }}, { status: 200 });
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

  const { user, userRef } = await loadUser(decodedToken);

  if (user && user.prompts_left > 0) {
  const {searchPrompt, documentPrompt, fullConversation} = await req.json()

  if (fullConversation.length === 0) {
    return NextResponse.json(
      { error: "fullConversation is empty" },
      { status: 400 }
    );
  }
  let gpt_flag = true;

      let llmResponse:any;
        try {
          if (fullConversation.length < 2) return;

          fullConversation[fullConversation.length - 2].content =
            "Answer in 500 words or less. Short answers are better.\n\n" +
            documentPrompt +
            "\n\n" +
            searchPrompt;
          console.log(fullConversation)
          llmResponse = await queryOpenAi(
            {
              model: "gpt-3.5-turbo-0125",
              format: "markdown",
              messages: [...fullConversation],
            },
            true
          );


        // Flag to determine whether we need to use LLAMA model
        if (!llmResponse) {
          gpt_flag = false;
        }

        return llmResponse; 
      } 
      catch (error) 
      {
        console.error("queryOpenAi failed: " + error);
        gpt_flag = false;
      }

      if (!gpt_flag) {
        console.log("switching to llama2 in conversation/route.ts for second response");

        let token_count = 0;
        const tokenizer = new GPT4Tokenizer({ type: 'gpt3' });

        for (let i = 0; i < fullConversation.length; i++) {
          token_count += tokenizer.estimateTokenCount(fullConversation[i].content);
        }

        token_count += tokenizer.estimateTokenCount(documentPrompt) + tokenizer.estimateTokenCount(searchPrompt) + 2;

        if (token_count > 2048) {
          return NextResponse.json({ latestBotResponse: "Token limit of 2048 exceeded, your prompt includes " + token_count + " tokens"});
        }

        try {
          llmResponse = await queryLlama2({
            "messages": [
              {
                "role": "user",
                "content": documentPrompt + "\n\n" + searchPrompt
              },
              ...fullConversation
            ]
          });
          console.log("Logging second response from llama2", llmResponse.choices[0].message.content);
        } catch (error) {
          console.error("queryLlama2 failed in conversation/route.ts for second response: " + error);
        }
      }

      console.log("WE ARE IN THE ROUTE- -----------------------")
      // console.log("Logging second response from OpenAi", llmResponse.body.getReader().read().value);
      if (llmResponse.choices[0].message.content) {
      return NextResponse.json({
        latestBotResponse: llmResponse.choices[0].message.content
      });
    } else {
      return NextResponse.json({
        latestBotResponse: ""
      });
    }
  }

  return NextResponse.json({ error: "No prompts left" }, { status: 403 });
}