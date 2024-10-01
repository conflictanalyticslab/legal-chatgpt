import { NextResponse } from "next/server";

/**
 * Validate users prompt count
 *
 * @param decodedToken
 * @returns
 */
export async function validatePromptCount(decodedToken: any, user:any, userRef:any) {
  if (!decodedToken) {
    return NextResponse.json(
      { error: "decodedToken is missing but there was no earlyResponse" },
      { status: 500 }
    );
  }

  // Invalid User
  if (!user) {
    return NextResponse.json({ error: "User doesn't exist" }, { status: 403 });
  }

  // No prompts left
  if (user && user.prompts_left <= 0)
    return NextResponse.json(
      { error: "User has no more prompts" },
      { status: 403 }
    );

  await userRef.update({ prompts_left: user.prompts_left - 1 }); // Update the number of prompts the user has left in the database
}
