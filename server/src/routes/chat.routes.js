import { Router } from "express";
import { ai, CHAT_MODEL } from "../config/ai.js";
import { embed } from "../services/embed.js";
import { getCachedAnswer, cacheAnswer } from "../services/cache.js";
import { searchVectors } from "../services/vector.js";

const router = Router();

// POST /api/ask — { question }
router.post("/", async (req, res) => {
  const { question } = req.body;

  if (!question)
    return res.status(400).json({ error: "Please provide a question." });

  try {
    // 1. Check if the answer exists in Redis cache
    const cached = await getCachedAnswer(question);
    if (cached) return res.json({ answer: cached, cached: true });

    // 2. Generate vector embedding for the user question
    const [questionVector] = await embed([question]);

    // 3. Retrieve the top 5 most relevant context matches from Pinecone
    const matches = await searchVectors(questionVector, 5);
    const context = matches.map((m) => m.metadata.text).join("\n\n---\n\n");

    // 4. Request completion from the AI using only the retrieved context
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
      throw new Error(
        "AI did not return any response. Please try again later.",
      );

    // 5. Cache the answer in Redis for subsequent fast lookups
    await cacheAnswer(question, answer);

    // Extract unique source references
    const sources = [...new Set(matches.map((m) => m.metadata.source))];

    res.json({ answer, sources, cached: false });
  } catch (err) {
    console.error("Ask Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
