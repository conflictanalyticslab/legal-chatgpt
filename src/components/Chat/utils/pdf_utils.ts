import { postWebUrl } from "@/util/requests/postWebUrl";
import { toast } from "@/components/ui/use-toast";
  
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