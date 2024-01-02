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
  const apiKey = process.env.LLAMA2_API_KEY;
  
  // helper function: if queue is not empty and not processing, pop a request out and send to the api, wait for 1 second, then call itself again
  const processQueue = async () => {
    // check if queue is empty, if so, set processing to false (so we are not currently processing any api requests) and return
    if (llama2_queue.length === 0) {
      llama2_processing = false;
      return;
    }
    
    // if queue is not empty, set processing to true and pop a request out of the queue as { data, resolve, reject }
    llama2_processing = true;
    const { data, resolve, reject } = llama2_queue.shift() as QueueItem;
  
    // send request to api
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + apiKey
        },
        body: JSON.stringify(data)
      });
      
      // check if response is ok, if not, throw error
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
    //   console.log("llama2 queue: " + llama2_queue);

      // resolve the promise with the content of pdf sent back from the api
      resolve(await response.json());
    } catch (error) {
      // log the error if something went wrong and reject with the error
      console.error("queryLlama2 failed: " + error);
      reject(error);
    }
  
    // wait for 1 second, then call itself again to process the next request in the queue
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