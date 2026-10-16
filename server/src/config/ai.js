import OpenAI from "openai";

import dotenv from "dotenv";
dotenv.config();

export const ai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

export const CHAT_MODEL = process.env.CHAT_MODEL;

export const EMBED_MODEL = process.env.EMBED_MODEL;
