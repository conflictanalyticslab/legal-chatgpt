/**
 * @file: runSearch.ts - 
 *
 * @author Kevin Yu <yu.kevin2002@gmail.com>
 * @date Jul 2024
 */

export type SearchResult = {
  title: string;
  source: string;
  url: string;
  abstract: string;
};

export const callSearchAPI = async (searchTerm: string) => {
  const results:any[] = [];

  /**
   * What is Google Search API?
   * TLDR: this API, you can use RESTful requests to get search results in JSON format.
   * Reference: https://developers.google.com/custom-search/docs/overview
   * 
   * cx => Search Engine ID
   * key => Google search Key
   * The siterestrict part is a resource path within the Google Custom Search JSON API. When you use siterestrict, it restricts the search results to the specified site collection defined by your custom search engine ID (cx parameter).
   */
  const urlGoogleSearch = `https://www.googleapis.com/customsearch/v1/siterestrict?cx=${process.env.NEXT_PUBLIC_GOOGLE_SEARCH_ID}&q=${searchTerm}&key=${process.env.NEXT_PUBLIC_GOOGLE_SEARCH_KEY}`;

  /**
   * What is Court Listener?
   * TLDR: CourtListener is a free legal research website containing millions of legal opinions from federal and state courts.
   * Reference: https://www.courtlistener.com/help/api/rest/#search-endpoint
   */
  const urlCourtListener = `https://www.courtlistener.com/api/rest/v3/search/?q=${searchTerm}`;

  // Wait for all promises to resolve before populating the results array
  const [resGoogleSearch, resCourtListener] = await Promise.all([
    fetch(urlGoogleSearch),
    fetch(urlCourtListener),
  ]);

  // Call Google Search API
  try {
    const googleJson = await resGoogleSearch.json();
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

  // Call Court Listener
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
  } catch (e) {
    console.error(e);
  }

  return results;
};
