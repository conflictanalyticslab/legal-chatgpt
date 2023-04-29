import axios from "axios";

export const handleSearch = async (searchTerm, setSearchTerm) => {
    // Scholars Portal
    // reference: https://github.com/scholarsportal/text-mining/blob/main/corpus-builder.py
    const page = 1;
    const pageLength = 20;
    const dataType = "full";
    const urlScholarsPortal = `/scholarsportal/search?q=((${searchTerm}))&page=${page}&page_length=${pageLength}&data=${dataType}&format=json`;

    // SerpAPI (Google Search)
    // reference: https://serpapi.com/search-api
    const urlSerpAPI = `/serpapi/search?engine=google&q="${searchTerm} site:www.canlii.org"&api_key=${process.env.REACT_APP_SERPAPI_KEY}`;

    // Google Search API
    // reference: https://developers.google.com/custom-search/v1/reference/rest/v1/cse/list
    const urlGoogleSearch = `/googlesearch/customsearch/v1/siterestrict?cx=${process.env.REACT_APP_GOOGLE_SEARCH_ID}&q=${searchTerm}&key=${process.env.REACT_APP_GOOGLE_SEARCH_KEY}`;

    // Court Listener
    // reference: https://www.courtlistener.com/help/api/rest/#search-endpoint
    const urlCourtListener = `/courtlistener/api/rest/v3/search/?q=${searchTerm}`;

    axios
        .all([
            axios.get(urlScholarsPortal),
            axios.get(urlGoogleSearch),
            axios.get(urlCourtListener),
        ])
        .then(
            axios.spread(
                (resScholarsPortal, resGoogleSearch, resCourtListener) => {
                    const results = [];
                    // for (const res of resScholarsPortal.data.response.results
                    //     .result) {
                    //     //console.log(res);
                    //     results.push({
                    //         url: res.url,
                    //         abstract: res.abstract,
                    //         title: res.title,
                    //         source: "Journal Articles",
                    //     });
                    // }
                    for (const res of resGoogleSearch.data.items) {
                        //console.log(res);
                        results.push({
                            url: res.link,
                            abstract: res.snippet,
                            title: res.title,
                            source: "Canadian Case Law",
                        });
                    }
                    for (const res of resCourtListener.data.results) {
                        results.push({
                            url:
                                "https://www.courtlistener.com" +
                                res.absolute_url,
                            abstract: res.snippet,
                            title: res.caseName,
                            source: "U.S. Case Law",
                        });
                    }
                    const elasticUrl = process.env.REACT_APP_ELASTICSEARCH_URL;
                    const config = {
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${process.env.REACT_APP_PRIVATE_SEARCH_KEY}`,
                        },
                    };
                    axios.post(elasticUrl, results, config).then((res) => {
                        setTimeout(function() {
                            setSearchTerm(searchTerm);
                        }, 500);
                    });
                }
            )
        )
        .catch((err) => {
            console.log(err);
            setSearchTerm(searchTerm);
        });
};
