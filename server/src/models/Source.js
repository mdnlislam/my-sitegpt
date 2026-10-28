import mongoose from "mongoose";

const sourceSchema = new mongoose.Schema(
  {
    botId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bot",
      required: true,
      index: true,
    },
    name: { type: String, required: true },
    type: { type: String, enum: ["text", "url", "file"], required: true },
    chunkCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

const Source = mongoose.model("Source", sourceSchema);
export default Source;
