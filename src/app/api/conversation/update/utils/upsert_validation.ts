import { authenticateApiUser } from "@/lib/api/middleware/authenticateApiUser";
import { loadUser } from "@/lib/api/middleware/loadUser";
import GPT4Tokenizer from "gpt4-tokenizer";
import { NextResponse } from "next/server";
const MAX_LLAMA_TOKEN_COUNT = 2048;

/**
 * Validates conversation data to ensure its properly formatted before sending to LLM
 * 
 * @param conversation 
 * @returns 
 */
export function validateConversation(conversation:any) {
  // Check for empty conversation data 
  if (conversation.length < 2) 
    return NextResponse.json({ error: "Improper question and response pairs", status: 400 });

  // Check for invalid question and response pair
  if(conversation[conversation.length - 2].role !== "user") 
    return NextResponse.json({
      error: "Conversation question and response ordering is invalid",
      status: 400,
    });
}

/**
 * Calculates the number of tokens use for user's query
 * 
 * @param documentPrompt 
 * @param searchPrompt 
 * @param conversation 
 * @returns {NextResponse || null}
 */
export function validateTokenCount(documentPrompt:string, searchPrompt:string, conversation:any) {
  // Calculate the number of tokens the conversation requires
  const tokenizer = new GPT4Tokenizer({ type: "gpt3" });
  let token_count = 0;

  // Sum tokens for the conversation
  for (let i = 0; i < conversation.length; i++) {
    token_count += tokenizer.estimateTokenCount(conversation[i].content);
  }
  
  // Sum tokens for the document prompt and search prompt
  token_count +=
    tokenizer.estimateTokenCount(documentPrompt) +
    tokenizer.estimateTokenCount(searchPrompt) +
    2;

  // Checks for valid token count
  if (token_count > MAX_LLAMA_TOKEN_COUNT) 
    return NextResponse.json({ latestBotResponse: `Token limit of 2048 exceeded, your prompt includes ${token_count} tokens` });
}

/**
 * Authenticates User 
 * 
 * @returns 
 */
export async function authenticateUser() {
  const { earlyResponse, decodedToken } = await authenticateApiUser();
  if (earlyResponse) return earlyResponse;
  if (!decodedToken) {
    return NextResponse.json(
      { error: "decodedToken is missing but there was no earlyResponse" },
      { status: 500 }
    );
  }
  return decodedToken;
}

/**
 * Checks if we can find the user
 * 
 * @param decodedToken 
 * @returns 
 */
export async function validateLoadedUser(decodedToken: any) {
  const { user } = await loadUser(decodedToken);
  if (!user) {
    return NextResponse.json({ error: "No user found" }, { status: 403 });
  }
  if (user.prompts_left < 0) {
    return NextResponse.json({ error: "No prompts left" }, { status: 403 });
  }
  return user;
}
