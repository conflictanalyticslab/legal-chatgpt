"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var queryLlama2_1 = require("../api/queryLlama2");
var data = {
    "messages": [
        {
            "role": "user",
            "content": "What is the largest ocean in the world?"
        }
    ],
    "temperature": 0.8,
    "max_tokens": 128
};
(0, queryLlama2_1.default)(data)
    .then(function (response) { return console.log(response.choices[0].message.content); })
    .catch(function (error) { return console.error('Error:', error); });
// const start_time = new Date().getTime();
// for (let i = 0; i < 1; i++) {
//   setTimeout(() => {
//     console.log(new Date().getTime() - start_time);
//     queryLlama2(data)
//       .then((response: any) => console.log(response.choices[0].message.content))
//       .catch((error: any) => console.error('Error:', error));
//   }, Math.random() * 1000);
// }
