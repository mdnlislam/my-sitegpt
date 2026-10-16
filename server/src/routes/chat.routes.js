import { Router } from "express";

import { ai, CHAT_MODEL } from "../config/ai";

import { embed } from "../services/vector";

import { getCachedAnswer, cacheAnswer } from "../services/cache.js";

const router = Router();

// POST /api/ask — { question }

router.post("/", async (req, res) => {
  const { question } = req.body;

  if (!question)
    return res.status(400).json({ error: "plz. give me question" });

  try {
    const cached = await getCachedAnswer(question);

    if (cached) return res.json({ answer: cached, cached: true });

    // ২. প্রশ্নকে ভেক্টর বানানো

    const [questionVector] = await embed([question]);
    // ৩. Pinecone থেকে সবচেয়ে কাছের ৫টা টুকরো

    matches = await searchVectors(questionVector, 5);

    const context = matches.map((m) => m.metadata.text).join("\n\n---\n\n");

    // ৪. শুধু ওই তথ্য দিয়ে AI-কে উত্তর লিখতে বলা

    const response = await ai.chat.completions.create({
      model: CHAT_MODEL,
      messages: [
        {
          role: "system",
          content:
            "Answer only from the information below. If the answer is not there, say you don't know. " +
            "Reply in the same language as the question.\n\nInformation:\n" +
            (context || "(nothing)"),
        },
        { role: "user", content: question },
      ],
    });

    const answer = response.choices?.[0]?.message?.content;
    if (!answer)
      throw new Error("AI কোনো উত্তর দেয়নি, একটু পরে আবার চেষ্টা করুন");
    // ৫. উত্তর Redis-এ রেখে দেওয়া, পরের বার দ্রুত দেওয়ার জন্য

    await cacheAnswer(question, answer);

    // কোন কোন সোর্স থেকে উত্তর এসেছে, সেটাও পাঠানো
    const sources = [...new Set(matches.map((m) => m.metadata.source))];

    res.json({ answer, sources, cached });
  } catch (err) {
    console.error("Ask Error", err.message);
    res.status(500).json({ error: err.message });
  }
});
