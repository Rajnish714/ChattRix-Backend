import { Message } from "../models/message.model.js";


export const getMessages = async (req, res) => {
  try {
    const { chatId } = req.query;
    console.log(chatId);
    if (!chatId) {
      return res.status(400).json("chatId is required");
    }

    const messages = await Message.find({ chatId })
      .populate("sender", "username")
      .sort({ createdAt: 1 });
   
 
    res.status(200).json(messages);
  } catch (err) {
   
 console.log("Error creating private chat:", err);
    res.status(500).json("Server error");
  }
};
