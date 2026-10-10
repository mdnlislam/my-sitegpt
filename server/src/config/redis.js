import dotenv from "dotenv";

dotenv.config();

import Redis from "ioredis";

export const redis = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: 1,
});

redis.on("connect", () => console.log("Redis connected successfully"));

redis.on("error", (err) => console.error("Redis connection error:", err));
