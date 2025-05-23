import dotenv from "dotenv"
import OpenAI from "openai";

dotenv.config();

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  throw new Error("No API Key detected");
}

const client = new OpenAI({
  apiKey: apiKey,
});

export const getOpenAIKey = (): string => {
  return apiKey;
};
