//store online users and all socket ids for multi-tab support
export const onlineUser = new Map();

import { Chat } from "../../src/models/chat.model.js";

//auto join connect socket to all chatId so delivered msg work globally
//Find all chats where this userId is inside the members array
export async function autoJoinUserChats(socket, userId) {
  const userChats = await Chat.find({ members: userId }).select("_id");

  userChats.forEach(chat => {
    socket.join(chat._id.toString());
  });
}
