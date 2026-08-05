import OpenAI from "openai";
const client=new OpenAI({baseURL:"http://localhost:11434/v1/",apiKey:"ollama"});
const response=await client.chat.completions.create({
  model:"gpt-oss:20b",
  messages:[{role:"user",content:"Audit this plan and return the main risk."}],
});
console.log(response.choices[0].message.content);
