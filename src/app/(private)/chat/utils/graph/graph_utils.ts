/**
 * Gathers all of the document text content and formats the text to be used in the prompt
 *
 * @param includedDocuments list of ids that the user wants to include in the query
 * @returns
 */
export function createGraphPrompt(graph: string) {
    // TODO
    if (graph === "") return "";
    else {
        console.log("graph: " + graph)
        const graphjson = JSON.parse(graph);
        return (
            graphjson.map(([question, answer, followup]: [string, string, string]) => 
                `If the user answers your question "${question}" with "${answer}", ask "${followup}".`
            ).join("\n\n")
        );
    }
  }