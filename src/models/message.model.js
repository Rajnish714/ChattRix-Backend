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
    { type: mongoose.Schema.Types.ObjectId, ref: "User", default: [] }
    ],

   seenBy: [
    { type: mongoose.Schema.Types.ObjectId, ref: "User", default: [] }
   ],

    text: { type: String, required: true },
  
    messageType: {
      type: String,
      enum: ["text", "image", "gif", "video", "audio", "file"],
      default: "text",
    },

    mediaUrl: {
      type: String,
      default: null,
    },

   },
 
  { timestamps: true }
);

export const Message = mongoose.model("Message", messageSchema);
