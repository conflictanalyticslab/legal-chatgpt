export const queryOpenAi = async (data: any) => {
  // specifying gpt model here
  data["model"] = "gpt-3.5-turbo-0125";
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify(data),
  });
  const result = await response.json();
  return result;
};
