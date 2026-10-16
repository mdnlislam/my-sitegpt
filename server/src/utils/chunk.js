// src/utils/chunk.js — লম্বা লেখাকে ছোট টুকরো করা
// ৪০০ অক্ষর করে, পাশের টুকরোর সাথে ৮০ অক্ষর মিল রেখে (যাতে বাক্য মাঝখানে কেটে অর্থ না হারায়)

export function makeChunks(text, size = 400, overlap = 80) {
  const clean = text.replace(/\n/g, " ").trim();

  const chunks = [];

  for (let i = 0; i < clean.length; i += size - overlap) {
    const piece = clean.slice(i, i + size).trim();

    if (piece.length > 20) chunks.push(piece);

    if (i + size >= clean.length) break;
  }
  return chunks;
}
