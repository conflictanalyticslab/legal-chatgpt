import { postWebUrl } from "@/util/requests/postWebUrl";
import { toast } from "@/components/ui/use-toast";
import { postPDF } from "@/util/requests/postPDF";
import { uploadPdfDocument } from "@/util/requests/uploadPdfDocument";
import GPT4Tokenizer from "gpt4-tokenizer";
import { useFilePicker } from "use-file-picker";
import { FileAmountLimitValidator, FileSizeValidator } from "use-file-picker/validators";

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

export async function filesSuccessfullyUploaded(plainFiles:any, setDocumentContent:any, setIncludedDocuments:any, setDocuments:any, documents:any, includedDocuments:any, setLoadingPDF:any ) {

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
    setLoadingPDF(false)
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
    setLoadingPDF(false)
}
}