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
      graphjson.map(([head, relation, tail]: [{data: string, type: string}, {data: string, type: string}, {data: string, type: string}]) => {
        if (tail.type == "example") {
          return `An example of "${head.data}", "${relation.data}" is ${tail.data}`;
        } if (tail.type == "instruction") {
          return `When "${head.data}", and "${relation.data}", you must "${tail.data}".`;
        } else {
          return `When performing "${head.data}", "${relation.data}" leads to "${tail.data}".`;
        }
      }).join("\n\n")
    );
  }
}