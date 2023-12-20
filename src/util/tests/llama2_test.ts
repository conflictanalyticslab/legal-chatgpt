import queryLlama2 from "../api/queryLlama2"

const data =  {
    "messages": [
      {
        "role": "user",
        "content": "What is the largest ocean in the world?"
      },
      {
        "role": "assistant",
        "content": "The largest ocean in the world is the Pacific Ocean, which covers an area of approximately 155.6 million square kilometers (60.1 million square miles) and accounts for approximately 46% of the Earth's total ocean area. It is also the deepest ocean, with a maximum depth of about 11,022 meters (36,198 feet) in the Mariana Trench."
      },
      {
        "role": "user",
        "content": "What's the second largest?"
      }
    ],
    "temperature": 0.8,
    "max_tokens": 128
  }

const start_time = new Date().getTime();

for (let i = 0; i < 100; i++) {
  setTimeout(() => {
    console.log(new Date().getTime() - start_time);
    queryLlama2(data)
      .then((response: any) => console.log(response.choices[0].message.content))
      .catch((error: any) => console.error('Error:', error));
  }, Math.random() * 1000);
}