/**
 * @file: route.ts - api/conversation/documents - Retrieves related documents via courtListener and GoogleAPI
 *
 * @author Kevin Yu <yu.kevin2002@gmail.com>
 * @date Jun 2024
 */

import { NextResponse } from "next/server";
import { apiErrorResponse } from "@/lib/utils";
import { queryOpenAI } from "@/app/features/chat/lib/query-open-ai";
import { fetchAPIDocs } from "@/lib/api-documents/fetch-api-docs";
import { getAuthenticatedUser } from "@/lib/auth/get-authenticated-user";

/**
 * Fetches documents from CanLII (Canadian Case Law) or CourtListener (US Case Law)
 * @param req the request object
 * @returns
 */
export async function POST(req: Request) {
  try {
    // Authentication
    const decodedToken = await getAuthenticatedUser();
    if (decodedToken instanceof NextResponse) return decodedToken;

    if (!decodedToken)
      return NextResponse.json(
        { error: "decodedToken is missing but there was no earlyResponse" },
        { status: 500 }
      );

    // Request Functionality
    const { userQuery, namespace } = await req.json();

    if (!userQuery || !namespace)
      throw new Error(
        "Please provide both userQuery and namespace for fetching documents"
      );

    // Generate keywords based on user's query
    const keywordResponse = await queryOpenAI(
      {
        model: "gpt-3.5-turbo-0125",
        messages: [
          {
            role: "assistant",
            content: `Summarize this query into 3 key words (eg. word1 word2 word3): ${userQuery}`,
          },
        ],
      },
      false
    );

    if (!keywordResponse)
      throw new Error(
        "Failed to fetch api documents due to bad keyword generation"
      );

    const keywordsSearched =
      keywordResponse?.choices[0]?.message?.content;

    // Calls elastic search to search for related documents
    const searchResults = await fetchAPIDocs(keywordsSearched, namespace);
    
    if (!searchResults) throw new Error("Failed to fetch api documents");

    return Response.json({
      success: true,
      error: null,
      data: searchResults,
    });
  } catch (error: unknown) {
    return Response.json(apiErrorResponse(error));
  }
}
