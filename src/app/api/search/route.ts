import { authenticateApiUser } from "@/util/api/middleware/authenticateApiUser";
import { queryOpenAi } from "@/util/api/queryOpenAi";
import { runSearch } from "@/util/api/runSearch";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { earlyResponse } = await authenticateApiUser();
  if (earlyResponse) {
    return earlyResponse;
  }

  const { searchTerm } = await req.json();
  const res = await queryOpenAi({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "user",
        content: `Search term: ${searchTerm}. Can you provide me with some synonyms for this search term, or fix any typo in this search term? Put the top 3 fixed results in a csv and just return that. For example, your response should just be: word1, word2, word3`,
      },
    ],
  });

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
  const results = synonyms.flatMap((s) => runSearch(s));

  return NextResponse.json({ results });
}
