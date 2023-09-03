import { authenticateApiUser } from "@/util/api/middleware/authenticateApiUser";
import { loadUser } from "@/util/api/middleware/loadUser";
import { queryOpenAi } from "@/util/api/queryOpenAi";
import { NextResponse } from "next/server";

const systemPrompt = {
  role: "system",
  content: "Answer in 500 words or less. Short answers are better.",
};

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

  const { fullConversation } = await req.json();
  if (fullConversation.length === 0) {
    return NextResponse.json(
      { error: "fullConversation is empty" },
      { status: 400 }
    );
  }

  const { user, userRef } = await loadUser(decodedToken);

  if (user && user.prompts_left > 0) {
    await userRef.update({ prompts_left: user.prompts_left - 1 });
    const firstReplyRes = await queryOpenAi({
      model: "gpt-3.5-turbo",
      messages: [systemPrompt, ...fullConversation],
    });

    // if (user?.prompts_left === 10) {
    //   const resContent = firstReplyRes.choices[0].message.content;
    //   const summarizeRes = await queryOpenAi({
    //     model: "gpt-3.5-turbo",
    //     messages: [
    //       {
    //         role: "user",
    //         content:
    //           resContent +
    //           " You are a searching the internet to find information related to this message. Pick two words to search. Output these words in lower case, no punctuation.",
    //       },
    //     ],
    //   });

    // await handleSearch(
    //   summarizeRes.choices[0].message.content,
    //   setSearchTerm
    // );
    // }

    console.log("Logging response from OpenAi", firstReplyRes);
    return NextResponse.json({
      latestBotResponse: firstReplyRes.choices[0].message.content,
    });
  }

  return NextResponse.json({ error: "No prompts left" }, { status: 403 });
}
