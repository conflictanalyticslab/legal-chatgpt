export function generatePromptFromDocuments(
  documents: {
    name: string;
    text: string;
  }[]
) {
  return (
    "Here are some legal documents you can reference.\n\n" +
    documents
      .map((doc) => `Document Name: ${doc.name}.\nDocument Text: ${doc.text}`)
      .join("\n\n")
  );
}
