import mongoose from "mongoose";

const AuthSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  refreshTokenHash: { type: String, required: true },
  expiresAt: { type: Date, required: true },
 }, { timestamps: true });

export const Auth = mongoose.model("Auth", AuthSchema);
