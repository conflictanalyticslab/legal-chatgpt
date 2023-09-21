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
<<<<<<< Updated upstream
  const results = synonyms.flatMap((s) => runSearch(s));

  return NextResponse.json({ results });
}
=======
  let results = [];
  for (const s of synonyms) {
    console.log(s)
    results = results.concat(await callSearchAPI(s));
    
  }
  // synonyms.map((s) => {
  //   callSearchAPI(s);
  // });
  
  console.log(results);
  // TO DO: We need to decide what response we want.
  return NextResponse.json({results: results});
}

const callSearchAPI = async (searchTerm: string) => {
  // Scholars Portal
  // reference: https://github.com/scholarsportal/text-mining/blob/main/corpus-builder.py
  const page = 1;
  const pageLength = 20;
  const dataType = "full";
  // const urlScholarsPortal = `/scholarsportal/search?q=((${searchTerm}))&page=${page}&page_length=${pageLength}&data=${dataType}&format=json`;

  // SerpAPI (Google Search)
  // reference: https://serpapi.com/search-api
  // const urlSerpAPI = `/serpapi/search?engine=google&q="${searchTerm} site:www.canlii.org"&api_key=${process.env.NEXT_PUBLIC_SERPAPI_KEY}`;

  // Google Search API
  // reference: https://developers.google.com/custom-search/v1/reference/rest/v1/cse/list
  const urlGoogleSearch = `https://www.googleapis.com/customsearch/v1/siterestrict?cx=${process.env.NEXT_PUBLIC_GOOGLE_SEARCH_ID}&q=${searchTerm}&key=${process.env.NEXT_PUBLIC_GOOGLE_SEARCH_KEY}`;

  // Court Listener
  // reference: https://www.courtlistener.com/help/api/rest/#search-endpoint
  const urlCourtListener = `https://www.courtlistener.com/api/rest/v3/search/?q=${searchTerm}`;

  var results = [];
  try {
    const [resGoogleSearch, resCourtListener] = await Promise.all([
      // fetch(urlScholarsPortal),
      fetch(urlGoogleSearch),
      fetch(urlCourtListener),
    ]);
    // const scholarsPortalJson = await resScholarsPortal.json();
    // for (const res of scholarsPortalJson.response.results
    //     .result) {
    //     //console.log(res);
    //     results.push({
    //         url: res.url,
    //         abstract: res.abstract,
    //         title: res.title,
    //         source: "Journal Articles",
    //     });
    // }
    // const googleJson = await resGoogleSearch.json();
    // console.log(googleJson)
    // for (const res of googleJson.items) {
    //   results.push({
    //     url: res.link,
    //     abstract: res.snippet,
    //     title: res.title,
    //     source: "Canadian Case Law",
    //   });
    // }

    const courtListenerJson = await resCourtListener.json();
    for (const res of courtListenerJson.results) {
      results.push({
        url: "https://www.courtlistener.com" + res.absolute_url,
        abstract: res.snippet,
        title: res.caseName,
        source: "U.S. Case Law",
      });
    }

    // console.log(results)

    // console.log(elasticResults);
  } catch (e) {
    console.error(e);
  }
  return results;
};
>>>>>>> Stashed changes
