import { Chat } from "../models/chat.model.js";

export async function getorCreatePrivateChatId(req,res) {
    try{
    const {otherUserId}= req.body
    
   const myId = req.user.userId;

    if (!otherUserId) {
      return res.status(400).json({ message: "otherUserId required" });
    }
     let chat = await Chat.findOne({
      isGroup: false,
      members: { $all: [myId, otherUserId] },
    });

    if (!chat) {
      chat = await Chat.create({
        isGroup: false,
        members: [myId, otherUserId],
      });
    }

    res.status(200).json(chat);
    } catch (err) {
    console.log("Error creating private chat:", err);
    res.status(500).json("Server error");
  }
   } 