import { NextResponse } from "next/server";

import { getAuthenticatedUser } from "@/lib/auth/get-authenticated-user";
import { validatePromptCount } from "@/lib/llm/validate-prompt-count";
import { queryOpenAI } from "@/app/features/chat/lib/query-open-ai";
import { loadUser } from "@/lib/middleware/load-user";
import { apiErrorResponse } from "@/lib/utils";

import prompt from "./prompt";

export async function POST(req: Request) {
  const decodedToken = await getAuthenticatedUser();
  if (decodedToken instanceof NextResponse) return decodedToken;
  if (!decodedToken) {
    return NextResponse.json(
      { success: false, error: "Unauthorized", data: null },
      { status: 401 }
    );
  }

  // from api/(routes)/conversation/conversation-title
  const { user, userRef } = await loadUser(decodedToken);
  const promptCount = validatePromptCount(decodedToken, user, userRef);
  if (promptCount instanceof NextResponse) return promptCount;

  const { query } = await req.json();

  try {
    const res = await queryOpenAI({
      model: "gpt-4-turbo-2024-04-09",
      messages: [
        {
          role: "developer",
          content: prompt,
        },
        {
          role: "user",
          content: query,
        },
      ],
      response_format: {
        type: "json_object",
      },
      temperature: 0,
    });

    return NextResponse.json({
      success: true,
      error: null,
      data: JSON.parse(res.choices[0].message.content),
    });
  } catch (error) {
    return NextResponse.json(apiErrorResponse(error), { status: 500 });
  }
}
