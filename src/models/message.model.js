import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
     chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
 
    deliveredTo: [
    { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  ],

  seenBy: [
    { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  ],
    text: { type: String, required: true },
 
  },
  { timestamps: true }
);

export const Message = mongoose.model("Message", messageSchema);
