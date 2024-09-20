import { toast } from "@/components/ui/use-toast";
import { elasticDtoToRelevantDocuments } from "@/app/(private)/chat/api/documents/transform";
import { postWebUrl } from "@/lib/requests/postWebUrl";
import { auth } from "@/lib/firebase/firebase";
import { getDocumentText } from "@/lib/api/firebase_utils/getDocuments";
import { UploadedDocument } from "@/types/Document";

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
}

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

export async function scrapePDFContent(
  userQuery: any,
  setAlert: any,
  setLoading: any
) {
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
 * Gathers all of the document text content and formats the text to be used in the prompt
 *
 * @param includedDocuments list of ids that the user wants to include in the query
 * @returns
 */
export async function createDocumentPrompt(includedDocuments: string[]) {
  try {
    // Fetches documents from firebase
    const documents = await getDocumentText(includedDocuments);

    if (!documents.success || !documents.data)
      throw new Error("Failed to upload document text");

    // Return back the raw text of the document
    return (
      "Here are some additional legal documents you can reference.\n\n" +
      documents.data
        .map(
          (doc: UploadedDocument) =>
            `Document Name: ${doc.name}.\nDocument Text: ${doc.text}`
        )
        .join("\n\n")
    );
  } catch (error: unknown) {
    console.log("Error in fetching document content from Firebase");
    return "";
  }
}
