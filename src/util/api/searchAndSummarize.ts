import { queryOpenAi } from "./queryOpenAi";
import { callSearchAPI } from "./runSearch";

export const searchAndSummarize = async (firstReplyContent: string) => {
    const summarizeRes = await queryOpenAi({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a searching the internet to find information related to this message. Please give two words to search in lower case, no punctuation.",
          },
          {
            role: "user",
            content: firstReplyContent,
          },
        ],
      });
  
      let toSearch = summarizeRes.choices[0].message.content;
  
      toSearch = toSearch.split(':');
      toSearch = toSearch[toSearch.length - 1].split(',');
  
      let results: any[] = [];
      for (const s of toSearch) {
        console.log(s)
        results = results.concat(await callSearchAPI(s));
        
      }

    return {searchResults: results, toSearch: summarizeRes.choices[0].message.content}
}