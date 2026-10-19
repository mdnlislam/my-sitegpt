import { Router } from "express";
import multer from "multer";

import { makeChunks } from "../utils/chunk.js";
import { readUrl, readFile } from "../utils/loaders.js";
import { embed } from "../services/embed.js";
import { saveVectors, deleteVectors } from "../services/vector.js";
import { clearCache } from "../services/cache.js";
import Source from "../models/Source.js";

const router = Router();
const upload = multer({ limits: { fileSize: 100 * 1024 * 1024 } }); // Limit file size to 100MB

// ---------- মূল কাজ: লেখা → টুকরো → embedding → Pinecone → MongoDB ----------

async function addSource(name, type, text) {
  const chunks = makeChunks(text);

  if (chunks.length === 0) throw new Error("No text chunks found");

  // ১. টেক্সটগুলোকে আগে ভেক্টরে রূপান্তর করতে হবে
  const vectors = await embed(chunks);

  const source = await Source.create({ name, type, chunkCount: chunks.length });

  try {
    await saveVectors(source.id, name, chunks, vectors);
  } catch (error) {
    await Source.findByIdAndDelete(source.id); // মাঝপথে ব্যর্থ হলে ডাটাবেজ থেকেও মুছে ফেলা
    throw error;
  }

  await clearCache(); // নতুন উৎস যোগ করার পরে ক্যাশ পরিষ্কার করুন
  return source;
}

// GET /api/sources — সব সোর্সের তালিকা
router.get("/", async (req, res) => {
  try {
    const sources = await Source.find().sort({ createdAt: -1 });
    res.json(sources);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/sources/text — সরাসরি লেখা  { title, text }
router.post("/text", async (req, res) => {
  const { title, text } = req.body;
  if (!text) return res.status(400).json({ error: "No text provided" });

  try {
    const source = await addSource(title, "text", text);
    res.status(201).json(source);
  } catch (err) {
    console.error("Text এরর:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/sources/url — ওয়েবসাইটের লিংক  { url }
router.post("/url", async (req, res) => {
  const { url } = req.body;
  if (!url || !url.startsWith("http"))
    return res.status(400).json({ error: "Invalid URL" });
  try {
    const text = await readUrl(url);
    const source = await addSource(url, "url", text);
    res.status(201).json(source);
  } catch (error) {
    console.error("URL এরর:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/sources/file — PDF, DOCX, TXT  (FormData-তে "file")
router.post("/file", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "plz. file add" });

  try {
    // uffer এর জায়গায় Buffer হবে
    const name = Buffer.from(req.file.originalname, "latin1").toString("utf8");
    const text = await readFile(req.file);
    const source = await addSource(name, "file", text);
    res.json(source);
  } catch (error) {
    console.error("file err", error.message);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/sources/:id — সোর্স আর তার সব ভেক্টর মোছা
router.delete("/:id", async (req, res) => {
  try {
    const source = await Source.findById(req.params.id);

    if (!source) return res.status(404).json({ error: "data not found" });

    await deleteVectors(source.id, source.chunkCount);
    await source.deleteOne();
    await clearCache();
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("delete err", err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
