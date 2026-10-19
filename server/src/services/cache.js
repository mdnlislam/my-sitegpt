import crypto from "crypto";

import { redis } from "../config/redis.js";

const ONE_DAY = 60 * 60 * 24;

function makeKey(question) {
  const clean = question.trim().toLowerCase();

  return "answer:" + crypto.createHash("md5").update(clean).digest("hex");
}

// Redis বন্ধ থাকলেও অ্যাপ চলবে, শুধু ক্যাশ কাজ করবে না

export async function getCachedAnswer(question) {
  try {
    return await redis.get(makeKey(question));
  } catch {
    return null;
  }
}

export async function cacheAnswer(question, answer) {
  try {
    await redis.set(makeKey(question), answer, "EX", ONE_DAY);
  } catch {}
}

// নতুন তথ্য যোগ বা মুছলে পুরনো উত্তরগুলো ভুল হতে পারে, তাই সব মুছে দেওয়া

export async function clearCache() {
  try {
    const keys = await redis.keys("answer:*");

    if (keys.length) await redis.del(...keys);
  } catch {
    return null;
  }
}
