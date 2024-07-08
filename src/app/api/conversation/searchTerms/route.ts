/**
 * @file: route.ts - api/conversation/searchTerms - Retrieves related documents via elastic search
 *
 * @author Kevin Yu <yu.kevin2002@gmail.com>
 * @date Jun 2024
 */

import { authenticateApiUser } from "@/util/api/middleware/authenticateApiUser";
// import { searchAndSummarize } from "@/util/api/elastic_search_utils/searchAndSummarize";
import { NextResponse } from "next/server";
import { queryOpenAi } from "@/util/LLM_utils/queryOpenAi";
import { callSearchAPI } from "@/util/api/elastic_search_utils/runSearch";

interface ErrorResp {
  errors: string[];
}

/**
 * Provide Keyword Elastic Search Prompt and Document Prompt
 *
 * @param {Request} req - The request object
 * @returns {Object} An object containing the elasticSearchQuery and documentContent
 * @returns {string} returns.elasticSearchQuery - The search query for ElasticSearch
 * @returns {string} returns.documentContent - The uploaded document content that'll be used within the query
 */
export async function POST(req: Request) {
  const errorResp:ErrorResp = { errors:[] }
  
  // Authentication
  const { earlyResponse, decodedToken } = await authenticateApiUser();
  if (earlyResponse) 
    return earlyResponse;

  if (!decodedToken) 
    return NextResponse.json(
      { error: "decodedToken is missing but there was no earlyResponse" },
      { status: 500 }
    );
  
  // Request Functionality
  const { userQuery } = await req.json();

  // Get key words from user's 
  const elasticSearchQuery = await queryOpenAi(
    {
      model: "gpt-3.5-turbo-0125",
      messages: [{
        role: "assistant",
        content: `Summarize this query into 3 key words (eg. word1 word2 word3): ${userQuery}`
      }],
    },
    false
  );

  let elasticKeyWordsQuery;
  if(elasticSearchQuery) {
    elasticKeyWordsQuery = elasticSearchQuery?.choices[0]?.message?.content
  }

  // Calls elastic search to search for related documents
  const searchResults = await callSearchAPI(elasticKeyWordsQuery);

  if(!searchResults || searchResults.length <= 0)
    errorResp.errors.push("Failed to generate elastic search result")

  // Checks if elastic search results failed
  if (errorResp.errors.length > 0) 
    return NextResponse.json(
      { 
        errors: errorResp.errors,
        status: 400 
      }
    );
  
  return NextResponse.json({
    elasticSearchResults: searchResults,
  });
};
