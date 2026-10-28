import mongoose from "mongoose";

const botSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: { type: String, required: true },
    welcomeMessage: {
      type: String,
      default: "Hi ! How can I help you today ?",
    },
  },
  { timestamps: true },
);

const Bot = mongoose.model("Bot", botSchema);

export default Bot;
