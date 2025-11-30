import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  isGroup: {
    type: Boolean,
    default: false,
  },

  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],

  groupName: {
    type: String,
    default: null
  },

  groupImage: {
    type: String,
    default: null
  },

  admins: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],

  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Message",
    default: null
  }

}, { timestamps: true });

export const Chat = mongoose.model("Chat", chatSchema);