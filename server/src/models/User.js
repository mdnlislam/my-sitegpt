// src/models/User.js — a business owner's account
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true }, // hashed with bcrypt, never the real password
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);

export default User;
