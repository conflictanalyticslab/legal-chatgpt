import { postWebUrl } from "@/util/requests/postWebUrl";
import { toast } from "@/components/ui/use-toast";
import { postPDF } from "@/util/requests/postPDF";
import { uploadPdfDocument } from "@/util/requests/uploadPdfDocument";
import GPT4Tokenizer from "gpt4-tokenizer";
import { useFilePicker } from "use-file-picker";
import { FileAmountLimitValidator, FileSizeValidator } from "use-file-picker/validators";
import { postSearchTerms } from "@/util/requests/postSearchTerms";
import { elasticDtoToRelevantDocuments, globalSearchAPIDtoToRelevantDocuments, pineconeDtoToRelevantDocuments } from "@/app/chat/api/documents/transform";
import { similaritySearch } from "@/app/chat/api/semantic-search";
import { getDocumentText } from "@/util/api/firebase_utils/getDocuments";
import { auth } from "@/firebase";

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
   * 
   * @param setDocumentContent 
   * @param setIncludedDocuments 
   * @param setDocuments 
   * @param documents 
   * @param includedDocuments 
   * @param setLoadingPDF 
   * @param setAlert 
   * @returns 
   */
export function handleUploadFile(setDocumentContent:any, setIncludedDocuments:any, setDocuments:any, documents:any, includedDocuments:any, setLoadingPDF:any, setAlert:any) {
  return useFilePicker({
    accept: ".pdf",
    readAs: "ArrayBuffer", // ArrayBuffer takes exactly as much space as the original file. DataURL, the default, would make it bigger.
    validators: [
      new FileAmountLimitValidator({ max: 1 }),
      new FileSizeValidator({ maxFileSize: 5 * 1024 * 1024 /* 5 megabytes */ }),
    ],
    onFilesSelected: () =>{
      setLoadingPDF(true);
    },
    onFilesRejected: ({ errors }) => {
      console.log(errors);
      setAlert("File is too big. We have a 5 Mb limit.");
      setLoadingPDF(false);
    },
    onFilesSuccessfullySelected: async ({ plainFiles }: any) => {
      filesSuccessfullyUploaded(plainFiles, setDocumentContent, setIncludedDocuments, setDocuments, documents, includedDocuments, setLoadingPDF);
    },
  })
}

export async function filesSuccessfullyUploaded(plainFiles:any, setDocumentContent:any, setIncludedDocuments:any, setDocuments:any, documents:any, includedDocuments:any, setLoading:any ) {

  // this callback is called when there were no validation errors
  let estimatedTokenCount = -1;
  let pdfFileSize = -1;

  try {
    const pdfContent = await postPDF(plainFiles[0]);

    pdfFileSize = plainFiles[0].size;

    if (pdfFileSize > 5 * 1024 * 1024) {
      throw new Error("PDF File uploaded too large");
    }

    const tokenizer = new GPT4Tokenizer({ type: "gpt3" });
    estimatedTokenCount = tokenizer.estimateTokenCount(pdfContent.content);

    if (estimatedTokenCount > 16384) {
      throw new Error("PDF token limit exceeded");
    }

    // Log the string
    setDocumentContent(pdfContent.content);
    setIncludedDocuments([...includedDocuments, pdfContent.uid]);

    const newDoc = await uploadPdfDocument({
      content: pdfContent.content,
      name: plainFiles[0].name,
    });
    setDocuments([...documents, newDoc]);
    setIncludedDocuments([...includedDocuments, newDoc.uid]);

    toast({
      title: "PDF uploaded successfully!",
    });
    setLoading(false)
  } catch (err: Error | any) {
    if (err.message === "PDF File uploaded too large") {
      toast({
        title:
          "The PDF file uploaded is too large, maximum of 5MB expected, your pdf is ' + pdfFileSize/(1024*1024) + ' bytes!",
        variant: "destructive",
      });
    } else if (
      err.message === "PDF token limit exceeded" &&
      estimatedTokenCount !== -1
    ) {
      toast({
        title:
          "The PDF file uploaded exceeds limit, maximum of 8192 token in each PDF uploaded, your pdf contains ' + estimatedTokenCount + ' tokens",
        variant: "destructive",
      });
    }
    setLoading(false)
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
 * @param globalSearch 
 * @param setInfoAlert 
 */
export async function pdfSearch(documentQueryMethod:string, userQuery:string, namespace:string, setRelevantDocs:any, setPdfLoading:any, setInfoAlert:any) {
  try {
    // Elastic Search
    if (documentQueryMethod === "elastic") {

      // Generate elastic search prompt and document prompt from Open AI
      const response = await postSearchTerms(userQuery);

      // Retrieve elastic search results and get selected pdf document(s) text
      const documents = await response.json();
      if(documents.status === 400) {
        throw("Couldn't generate Elastic Search results");
      }

      setRelevantDocs(elasticDtoToRelevantDocuments(documents.elasticSearchResults));
    } 
    else 
    {
      // Static PDF File Search
      const similarDocs = await similaritySearch(userQuery, 3, namespace);
      setRelevantDocs(pineconeDtoToRelevantDocuments(similarDocs));
    }
  } catch (e) {
    console.log("Failed to fetch global documents", e);
    setInfoAlert("Failed to fetch globally searched documents");
    setRelevantDocs([])
  } finally {
    setPdfLoading(false);
  }
}


/**
 * (Global Search) Retrieve documents from Courtlistener and upsert them to pinecone to allow for RAG
 * 
 * @param userQuery 
 * @param namespace 
 * @param setRelevantDocs 
 * @param setPdfLoading 
 * @param setInfoAlert 
 */
export async function fetchGlobalDocuments( userQuery:string, namespace:string = '', setRelevantDocs:any, setPdfLoading:any, setInfoAlert:any) {
  try {
      const response = await fetch(
        "https://global-search.openjustice.ai/search/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${await auth?.currentUser?.getIdToken()}`,
          },
          body: JSON.stringify({ user_query: userQuery }),
        }
      );

      if (!response?.ok) throw "Failed to fetch response";

      const responseData = await response.json();
      const similarDocs = responseData.documents;
      setRelevantDocs(globalSearchAPIDtoToRelevantDocuments(similarDocs));
      setPdfLoading(false);
    } catch (error: any) {
      setInfoAlert(error);
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


