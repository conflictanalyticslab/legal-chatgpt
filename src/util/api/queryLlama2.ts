// define new type to hold the data passed in and status
type QueueItem = {
    data: object;
    resolve: (value: any) => void;
    reject: (reason: any) => void;
  }
  
  
  // initialize constants
  let llama2_queue: QueueItem[] = [];
  let llama2_processing = false;
  const url = 'https://Llama-2-70b-chat-openjustice-serverless.eastus2.inference.ai.azure.com/v1/chat/completions'
//   const apiKey = process.env.LLAMA2_API_KEY;
  const apiKey = "OgWjb3oPCHbqfyMuTQ4pA2WoAxqtWtZ3"
  
  // if queue is not empty and not processing, pop a request out and send to the api, wait for 1 second, then call itself again
  const processQueue = async () => {
    if (llama2_queue.length === 0) {
      llama2_processing = false;
      return;
    }
  
    llama2_processing = true;
    const { data, resolve, reject } = llama2_queue.shift() as QueueItem;
  
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + apiKey
        },
        body: JSON.stringify(data)
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
    //   console.log("llama2 queue: " + llama2_queue);
  
      resolve(await response.json());
    } catch (error) {
      console.error("queryLlama2 failed: " + error);
      reject(error);
    }
  
    setTimeout(processQueue, 1000);
  }
  
  // check if apiKey exists, then push new request and call processQueue if not processing
  const queryLlama2 = (data: object) => {
    if (!apiKey) {
      console.error(apiKey);
      throw new Error("Llama2 api key not provided, need to provided api key to invoke the endpoint")
    }
  
    return new Promise((resolve, reject) => {
      llama2_queue.push({ data, resolve, reject });
  
      if (!llama2_processing) {
        processQueue();
      }
    });
  };
  
  export default queryLlama2;