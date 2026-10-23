import dotenv from "dotenv";
dotenv.config();

import express from "express";

import cors from "cors";
import connectDB from "./config/db.js";
import { connectPinecone } from "./config/pinecone.js";
import "./config/redis.js";
import sourceRoutes from "./routes/source.routes.js";
import chatRoutes from "./routes/chat.routes.js";
const app = express();
import dns from "node:dns";
app.use(cors());
app.use(express.json());
dns.setServers(["8.8.8.8", "8.8.4.4"]);
app.get("/", (req, res) => res.json({ message: "AI Server Running" }));
app.use("/api/sources", sourceRoutes);
app.use("/api/ask", chatRoutes);

// ফাইল খুব বড় হলে বা অন্য অপ্রত্যাশিত এরর

app.use((err, req, res, next) => {
  console.error(err.message);
  const tooBig = err.code === "LIMIT_FILE_SIZE";

  res
    .status(tooBig ? 400 : 500)
    .json({ error: tooBig ? " file high Mb" : err.message });
});

// আগে MongoDB আর Pinecone প্রস্তুত, তারপর সার্ভার চালু

async function start() {
  try {
    connectDB();

    connectPinecone();

    app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  } catch (err) {
    console.error(" server not running ", err.message);
    process.exit(1);
  }
}

start();
