import axios from "axios";

export const query = async (data) => {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
        headers: {
            Authorization: `Bearer ${process.env.REACT_APP_MODEL_API_KEY}`,
            "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify(data),
    });
    const result = await response.json();
    return result;
};

const callSearchAPI = (searchTerm) => {
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
            // axios.get(urlScholarsPortal),
            axios.get(urlGoogleSearch),
            axios.get(urlCourtListener),
        ])
        .then(
            axios.spread((resGoogleSearch, resCourtListener) => {
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
                        url: "https://www.courtlistener.com" + res.absolute_url,
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
                    console.log(searchTerm, res);
                });
            })
        )
        .catch((err) => {
            console.log(err);
        });
};

export const handleSearch = async (searchTerm, setSearchTerm) => {
    await query({
        model: "gpt-3.5-turbo",
        messages: [
            {
                role: "user",
                content: `Search term: ${searchTerm}. Can you provide me with some synonyms for this search term, or fix any typo in this search term? Put the top 3 fixed results in a csv and just return that. For example, your response should just be: word1, word2, word3`,
            },
        ],
    })
        .then((res) => {
            console.log(res);
            var synonyms = [searchTerm].concat(
                res.choices[0].message.content.split(", ")
            );
            synonyms = [...new Set(synonyms)]; // remove duplicates
            console.log(synonyms);
            const elasticUrl = process.env.REACT_APP_ELASTICSEARCH_SYNONYM_API;
            const config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${process.env.REACT_APP_PRIVATE_SEARCH_KEY}`,
                },
            };
            axios
                .post(elasticUrl, { synonyms: synonyms }, config)
                .then((res) => {
                    console.log(res);
                });
            synonyms.map((s) => {
                callSearchAPI(s);
            });
        })
        .then((res) => {
            setSearchTerm(searchTerm);
        });

    // setTimeout(function () {

    // }, 1000);
};
