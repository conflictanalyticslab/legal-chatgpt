
import { authenticateApiUser } from "@/util/api/middleware/authenticateApiUser";
import { loadUser } from "@/util/api/middleware/loadUser";
import { queryOpenAi } from "@/util/api/queryOpenAi";
import queryLlama2 from "@/util/api/queryLlama2";
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
  
      // console.log(fullConversation);

      let secondReplyRes:any;
        try {
        secondReplyRes = await queryOpenAi({
          model: "gpt-3.5-turbo-0125",
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
        }, true);
        if (!secondReplyRes) {
          gpt_flag = false;
        }
        return secondReplyRes;
      } catch (error) {
        console.error("queryOpenAi failed: " + error);
        gpt_flag = false;
      }

      if (!gpt_flag) {
        console.log("switching to llama2 in conversation/route.ts for second response");

        try {
          secondReplyRes = await queryLlama2({
            "messages": [
              {
                "role": "user",
                "content": documentPrompt + "\n\n" + searchPrompt
              },
              ...fullConversation
            ]
          });
          console.log("Logging second response from llama2", secondReplyRes.choices[0].message.content);
        } catch (error) {
          console.error("queryLlama2 failed in conversation/route.ts for second response: " + error);
        }
      }

      
      // console.log("Logging second response from OpenAi", secondReplyRes.body.getReader().read().value);
      if (secondReplyRes.choices[0].message.content) {
      return NextResponse.json({
        latestBotResponse: secondReplyRes.choices[0].message.content
      });
    } else {
      return NextResponse.json({
        latestBotResponse: ""
      });
    }
  }

  return NextResponse.json({ error: "No prompts left" }, { status: 403 });
}