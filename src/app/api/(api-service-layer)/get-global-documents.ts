/**
 * (Global Search) Retrieve documents from Courtlistener and upsert them to pinecone to allow for RAG
 * 
 * @param userQuery 
 * @param namespace 
 * @param setRelevantDocs 
 * @param setPdfLoading 
 * @param setInfoAlert 
 */
export async function getGlobalDocuments( userQuery:string, auth:any) {
  const response = await fetch("https://global-search.openjustice.ai/search/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${await auth?.currentUser?.getIdToken()}`,
    },
    body: JSON.stringify({ user_query: userQuery }),
  });

  if (!response?.ok)
    throw "unable to retrieve relevant documents from CourtListener";
  const responseData = await response.json();
  return responseData.documents;
}
