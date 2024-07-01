import { callSearchAPI } from "./runSearch";

export const searchAndSummarize = async (userQuery: string) => {

  // Elastic Search
  const results = await callSearchAPI(userQuery);

  return { searchResults: results };
}