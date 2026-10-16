import { ai, EMBED_MODEL } from "../config/ai.js";

export async function embed(text) {
  const vector = [];

  for (let i = 0; i < text.length; i += 50) {
    const res = await ai.embeddings.create({
      model: EMBED_MODEL,
      input: text.slice(i, i + 50),
    });

    vector.push(...res.data.map((item) => item.embedding));
  }

  return vector;
}
