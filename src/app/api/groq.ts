import { Groq } from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const completion = await groq.chat.completions.create({
  model: "meta-llama/Llama-Guard-4-12B",
  messages: [{ 
    role: "system", 
    content: "Hello, world!" }],
});

console.log(completion);







