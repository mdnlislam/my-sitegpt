// src/services/vector.js — Pinecone-এ ভেক্টর রাখা, খোঁজা, মুছা
import { index } from "../config/pinecone.js";

// প্রতিটা টুকরোর ID হবে "sourceId-0", "sourceId-1"... যাতে পরে মুছতে সহজ হয়
const makeId = (sourceId, i) => `${sourceId}-${i}`;

export async function saveVectors(sourceId, sourceName, chunks, vectors) {
  const records = chunks.map((text, i) => ({
    id: makeId(sourceId, i),
    values: vectors[i],
    metadata: { text, sourceId, source: sourceName }, // আসল লেখাও সাথে রাখা
  }));

  // একসাথে ১০০টা করে পাঠানো
  for (let i = 0; i < records.length; i += 100) {
    await index.upsert({ records: records.slice(i, i + 100) });
  }
}

export async function searchVectors(vector, topK = 5) {
  const result = await index.query({ vector, topK, includeMetadata: true });
  return result.matches; // [{ id, score, metadata: { text, source } }, ...]
}

export async function deleteVectors(sourceId, chunkCount) {
  const ids = Array.from({ length: chunkCount }, (_, i) => makeId(sourceId, i));
  for (let i = 0; i < ids.length; i += 1000) {
    await index.deleteMany({ ids: ids.slice(i, i + 1000) });
  }
}
