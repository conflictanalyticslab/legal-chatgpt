import { postWebUrl } from "@/util/requests/postWebUrl";
import { toast } from "@/components/ui/use-toast";
import { postPDF } from "@/util/requests/postPDF";
import { uploadPdfDocument } from "@/util/requests/uploadPdfDocument";
import GPT4Tokenizer from "gpt4-tokenizer";
import { postSearchTerms } from "@/util/requests/postSearchTerms";
import { elasticDtoToRelevantDocuments, globalSearchAPIDtoToRelevantDocuments, pineconeDtoToRelevantDocuments } from "@/app/(private)/chat/api/documents/transform";
import { getDocumentText } from "@/util/api/firebase_utils/getDocuments";
import { auth } from "@/firebase";
import { fetchSemanticSearch } from "../../api/actions/fetchSemanticSearch";
import { DocumentQueryOptions } from "../../enum/document-query.enum";
import { fetchGlobalDocuments } from "@/util/requests/fetchGlobalDocuments";

  /**
   * Extracts URLs from a given text
   * @param text string
   * @returns {string[]} list of url strings found in the query
   */
  export function parseUrls(text: string) {
    const urlRegex =
      /(https?:\/\/)?([A-Za-z_0-9.-]+[.][A-Za-z]{2,})(\/[A-Za-z0-9-._~:\/\?#\[\]@!$&'()*+,;=]*)?/g;
    let match;
    const urls = [];
    while ((match = urlRegex.exec(text))) {
      urls.push(match[0]);
    }
    return urls;
  };


  /**
   * 
   * @param string 
   * @returns 
   */
  const isValidUrl = (string: string) => {
    try {
      new URL(string);
    } catch (_) {
      return false;
    }

    return true;
  };
  
  export async function scrapePDFContent(userQuery:any, setAlert:any, setLoading:any) {

        const urls = parseUrls(userQuery);

        // Parses any urls in the string and validates them
        for (let url of urls) {
          if (!url.includes("http") || !url.includes("https")) {
            url = "https://" + url;
          }
          if (!isValidUrl(url)) {
            setAlert("Invalid URL: " + url);
            setLoading(false);
            return;
          }
        }
    
        let urlContent;
        let urlContentUserInput = userQuery;
    
        // Fetching website content and replacing the url in the query with the website content.
        for (const url of urls) {
          try {
            urlContent = await postWebUrl(url);
            urlContentUserInput = urlContentUserInput.replace(url, urlContent.text);
          } catch (error: any) {
            console.error(error);
            if (error.message.includes("400")) {
              console.log(error.status);
              toast({
                title:
                  "Error fetching content from URL: " +
                  url +
                  " doesn't allow web scraping!",
                variant: "destructive",
              });
            } else {
              toast({
                title:
                  "Error fetching content from URL: " +
                  url +
                  ", Please check the URL spelling and try again",
                variant: "destructive",
              });
            }
    
            setLoading(false);
            return;
          }
        }
  }

/**
 * Retrieve relevant pdfs from either CourtListener or Static PDFs from Pinecone
 * 
 * Note: since we are only doing either CourtListener or Static Semantic PDF search frrom Pinecone we don't need to specify the index name
 * 
 * @param documentQueryMethod 
 * @param userQuery 
 * @param namespace 
 * @param setRelevantDocs 
 * @param setPdfLoading 
 * @param setInfoAlert 
 */
export async function pdfSearch(documentQueryMethod:string, userQuery:string, namespace:string, setRelevantDocs:any, setPdfLoading:any, setInfoAlert:any) {
  try {
    // Keyword Search Documents
    if (documentQueryMethod === DocumentQueryOptions.keywordSearchValue) {
      console.log("keyword")
      // Generate elastic search prompt and document prompt from Open AI
      const documents = await postSearchTerms(userQuery);
      setRelevantDocs(elasticDtoToRelevantDocuments(documents.elasticSearchResults));
    } 
    else if(documentQueryMethod === DocumentQueryOptions.semanticSearchValue)
    {
      console.log("semantic")

      // Semantic Search Documents
      const similarDocs = await fetchSemanticSearch(userQuery, 3, namespace);
      setRelevantDocs(pineconeDtoToRelevantDocuments(similarDocs));
    }
    else if(documentQueryMethod === DocumentQueryOptions.globalSearchValue) {
      console.log("global")

      // Global Search Documents
      const similarDocs = await fetchGlobalDocuments(userQuery, auth)
      setRelevantDocs(globalSearchAPIDtoToRelevantDocuments(similarDocs));
    }
  } catch (e) {
    console.log("Failed to fetch global documents", e);
    setRelevantDocs([])
    throw("Failed to fetch documents.")
  } finally {
    setPdfLoading(false);
  }
}

/**
 * Gathers all of the document text content that the user selects
 * 
 * @param includedDocuments list of ids that the user wants to include in the query
 * @returns 
 */
export async function createDocumentPrompt(  
  includedDocuments: string[]
) {
  const documents = await getDocumentText(includedDocuments); // Fetches documents from firebase
  if (!documents) return '';

  return (
    "Here are some legal documents you can reference.\n\n" +
    documents
      .map((doc) => `Document Name: ${doc.name}.\nDocument Text: ${doc.text}`)
      .join("\n\n")
  );
}


