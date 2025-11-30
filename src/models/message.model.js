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
   
    text: { type: String, required: true },
    isSeen:{type:Boolean, default:false}
  },
  { timestamps: true }
);

export const Message = mongoose.model("Message", messageSchema);
