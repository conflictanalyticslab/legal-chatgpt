import { queryOpenAi } from "./queryOpenAi";
import {queryLlama2} from "./queryLlama2";
import { callSearchAPI } from "./runSearch";

export const searchAndSummarize = async (firstReplyContent: string) => {
    const summarizeRes = await queryOpenAi({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a searching the internet to find information related to this message. Please give two words (and only those words) to search in lower case, no punctuation.",
        },
        {
          role: "user",
          content: firstReplyContent,
        },
      ],
    });

    if (!summarizeRes || !summarizeRes.choices || summarizeRes.choices.length === 0) {
      console.error("Error from OpenAI: " + summarizeRes);
      console.log("switching to llama2");

      // set a 1 second time out between llama2 requests for stability
      setTimeout(async () => {
        try {
          const summarizeRes = await queryLlama2({
            messages: [
              {
                role: "system",
                content:
                  "You are a searching the internet to find information related to this message. Please give two words (and only those words) to search in lower case, no punctuation.",
              },
              {
                role: "user",
                content: firstReplyContent,
              },
            ],
          });
          console.log("Logging response from llama2", summarizeRes.choices[0].message.content);
        } catch (error) {
          console.error("queryLlama2 failed: " + error);
        }
      }, 1000);

      

  }
  
    let toSearch = summarizeRes.choices[0].message.content;

    toSearch = toSearch.split(':');
    toSearch = toSearch[toSearch.length - 1].split(',');

    let results: any[] = [];
    for (const s of toSearch) {
      console.log(s)
      results = results.concat(await callSearchAPI(s));
      
    }
    
    const elasticUrl = process.env.NEXT_PUBLIC_ELASTICSEARCH_URL || "";
    const elasticResults = await fetch(elasticUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_PRIVATE_SEARCH_KEY}`,
      },
      body: JSON.stringify(results), // Assuming 'results' is the data you want to send
    });
    return {searchResults: results, toSearch: summarizeRes.choices[0].message.content}
}