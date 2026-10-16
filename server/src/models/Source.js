import mongoose from "mongoose";

const sourceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, enum: ["text", "url", "file"], required: true },
    chunkCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export default mongoose.model("Source", sourceSchema);
