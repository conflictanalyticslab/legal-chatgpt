import queryLlama2 from "../api/queryLlama2"

const data =  {
    "messages": [
      {
        "role": "user",
        "content": "What is the largest ocean in the world?"
      }
    ],
    "temperature": 0.8,
    "max_tokens": 128
  }

queryLlama2(data)
.then((response: any) => console.log(response.choices[0].message.content))
.catch((error: any) => console.error('Error:', error));

// const start_time = new Date().getTime();

// for (let i = 0; i < 1; i++) {
//   setTimeout(() => {
//     console.log(new Date().getTime() - start_time);
//     queryLlama2(data)
//       .then((response: any) => console.log(response.choices[0].message.content))
//       .catch((error: any) => console.error('Error:', error));
//   }, Math.random() * 1000);
// }