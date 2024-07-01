export type SearchResult = {
  title: string;
  source: string;
  url: string;
  abstract: string;
};

export const callSearchAPI = async (searchTerm: string) => {
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

  const results:any[] = [];

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
  try {
    const googleJson = await resGoogleSearch.json();
    // console.log(JSON.stringify(googleJson));
    // console.log(JSON.stringify(googleJson.items));
    if (!googleJson.items) {
      console.error("Google Search API failed");
      return results;
    }
    for (const res of googleJson.items) {
      results.push({
        url: res.link,
        abstract: res.snippet,
        title: res.title,
        source: "Canadian Case Law",
      });
    }
  } catch (e) {
    console.error(e);
  }
  try {
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
