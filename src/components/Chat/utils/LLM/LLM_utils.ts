import { getDocumentText } from "@/util/api/firebase_utils/getDocuments";

export async function createDocumentPrompt(  
  includedDocuments: string[]
) {
  const documents = await getDocumentText(includedDocuments);

  if (!documents) return '';

  return (
    "Here are some legal documents you can reference.\n\n" +
    documents
      .map((doc) => `Document Name: ${doc.name}.\nDocument Text: ${doc.text}`)
      .join("\n\n")
  );
}
