export const postWebUrl = async (url: string): Promise<any> => {

    try {
        const response = await fetch("http://74.235.198.154:5001/robots", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({"url": url}),
          });
        
          if (!response.ok) {
            throw new Error(`Error trying to extract content from url: ${response.status}`);
          }
        
          return response.json(); // This presumes the API will return JSON
    } catch (error){
        throw new Error(`Error trying to extract content from url: ${error}`);
    }
  };