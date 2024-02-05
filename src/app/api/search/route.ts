import { authenticateApiUser } from "@/util/api/middleware/authenticateApiUser";
import { queryOpenAi } from "@/util/api/queryOpenAi";
import queryLlama2 from "@/util/api/queryLlama2";
import { callSearchAPI } from "@/util/api/runSearch";
import { NextResponse } from "next/server";



export async function POST(req: Request) {
  const { earlyResponse } = await authenticateApiUser();
  if (earlyResponse) {
    return earlyResponse;
  }

  const { searchTerm } = await req.json();
  let res:any;
  let gpt_flag = true;
  
  try {
    res = await queryOpenAi({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: `Search term: ${searchTerm}. Can you provide me with some synonyms for this search term, or fix any typo in this search term? Put the top 3 fixed results in a csv and just return that. For example, your response should just be: word1, word2, word3`,
        },
      ],
    });
    if (!res || !res.choices || res.choices.length === 0) {
      gpt_flag = false;
    }
  } catch (error) {
    console.error("queryOpenAi failed: " + error);
    gpt_flag = false;
  }

  if (!gpt_flag) {
    console.error("Error from OpenAI: " + res);
    console.log("switching to llama2 in search/route.ts for first response");
    try {
        res = await queryLlama2({
        "messages": [
          {
            "role": "user",
            "content": `Search term: ${searchTerm}. Can you provide me with some synonyms for this search term, or fix any typo in this search term? Put the top 3 fixed results in a csv and just return that. For example, your response should just be: word1, word2, word3`,
          },
        ],
      });
      console.log("Logging response from llama2", res.choices[0].message.content);
    } catch (error) {
      console.error("queryLlama2 failed in search/route.ts for first response: " + error);
    }
  }

  console.log(res);
  let synonyms = [searchTerm].concat(
    res.choices[0].message.content.split(", ")
  );
  synonyms = [...new Set(synonyms)]; // remove duplicates
  console.log(synonyms);
  //   const elasticUrl = process.env.NEXT_PUBLIC_ELASTICSEARCH_SYNONYM_API || "";
  //   const elasticRes = fetch(elasticUrl, {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //       Authorization: `Bearer ${process.env.NEXT_PUBLIC_PRIVATE_SEARCH_KEY}`,
  //       // Add any other headers you need here
  //     },
  //     body: JSON.stringify({ synonyms: synonyms }),
  //   });
  let results: any[] = [];
  for (const s of synonyms) {
    console.log(s)
    results = results.concat(await callSearchAPI(s));
    
  }

  console.log("================\n" + JSON.stringify(results));

  const elasticUrl = process.env.NEXT_PUBLIC_ELASTICSEARCH_URL || "";
  const elasticResults = await fetch(elasticUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_PRIVATE_SEARCH_KEY}`,
    },
    body: JSON.stringify(results), // Assuming 'results' is the data you want to send
  });
  console.log(elasticResults);
  // synonyms.map((s) => {
  //   callSearchAPI(s);
  // });
  
  // console.log(results);
  // TO DO: We need to decide what response we want.
  return NextResponse.json({});
}

