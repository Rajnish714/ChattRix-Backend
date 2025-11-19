import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group", default: null },
  text: { type: String, required: true },
 
},{timestamps:true});

export const Message = mongoose.model("Message", messageSchema);