import { index } from "../config/pinecone.js";

const makeID = (sourceID, i) => `${sourceID}-${i}`;

export async function saveVectors(sourceID, sourceName, chunk, vectors) {
  const records = chunk.map((text, i) => ({
    id: makeID(sourceID, i),
    values: vectors[i],
    metadata: {
      text,
      sourceID,
      source: sourceName,
    },
  }));

  for (let i = 0; i < records.length; i += 100) {
    await index.upsert({ records: records.slice(i, i + 100) });
  }
}

export async function deleteVectors(vector, topk = 5) {
  const results = await index.query({ vector, topk, includeMetadata: true });
  return results.matches;
}

export async function deleteVectors(sourceID, chunkCount) {
  const ids = Array.from({ length: chunkCount }, (_, i) => makeID(sourceID, i));

  for (let i = 0; i < ids.length; i += 1000) {
    await index.deleteMany({ ids: ids.slice(i, i + 1000) });
  }
}
