import { authenticateApiUser } from "@/util/api/middleware/authenticateApiUser";
import { loadUser } from "@/util/api/middleware/loadUser";
import { queryOpenAi } from "@/util/api/queryOpenAi";
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
      messages: [
        {
          role: "system",
          content: "Answer in 500 words or less. Short answers are better.",
        },
        ...fullConversation,
      ],
    });

    const firstReplyContent = firstReplyRes.choices[0].message.content;
    console.log("Logging response from OpenAi", firstReplyRes);

    const summarizeRes = await queryOpenAi({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a searching the internet to find information related to this message. Pick two words to search. Output these words in lower case, no punctuation.",
        },
        {
          role: "user",
          content: firstReplyContent,
        },
      ],
    });

    // When we actually run searches, we will need to add another prompt to incorporate the information.
    // We will also need to abstract the search logic out of /api/search so we can call it here as a function.
    console.log(
      "Search keywords (TO DO: Actually run a search)",
      summarizeRes.choices[0].message.content
    );

    return NextResponse.json({
      latestBotResponse: firstReplyContent,
    });
  }

  return NextResponse.json({ error: "No prompts left" }, { status: 403 });
}
