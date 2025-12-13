import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otpHash: { type: String, required: true }, 
   type: { type: String, enum: ["register", "forgot"], required: true },
   
   signupData: {
    type: {
      passwordHash: { type: String },
      username: { type: String },
      profilePic: { type: String },
     },
    default: undefined, 
   },
   
    used: {
      type: Boolean,
      default: false,
    },

  expiresAt: { type: Date, required: true }
});


otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Otp = mongoose.model("Otp", otpSchema);