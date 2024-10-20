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
        const graphjson = JSON.parse(graph);
        return (
            "Here are some relationships you can reference:\n\n" +
            graphjson.map(([head, relation, tail]: [string, string, string]) => 
                `When performing "${head}", "${relation}" leads to "${tail}".`
            ).join("\n\n")
        );
    }
  }