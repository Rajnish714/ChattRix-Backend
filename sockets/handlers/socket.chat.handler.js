import { Message } from "../../src/models/message.model.js";
import { User } from "../../src/models/user.model.js";
import { Chat } from "../../src/models/chat.model.js";
import { onlineUser, autoJoinUserChats } from "../utils/socket.utils.js";

export async function registerSocketHandlers(io, socket) {

  const userId = socket.data.userId;
  console.log("user Conneted= ", socket.id);

  //fetch username and check user for gloabal use
  const user = await User.findById(userId).select("username");
  if (!user) return socket.disconnect();
  socket.join(userId);    
  await autoJoinUserChats(socket, userId);

  //set online users for online status
  if (!onlineUser.has(userId)) {
    onlineUser.set(userId, []);
  }
  onlineUser.get(userId).push(socket.id);

  socket.data.userId = userId;
  socket.data.username = user.username;

  console.log(`🟢 ${userId} connected (${socket.id})`);

  io.emit("online_users", Array.from(onlineUser.keys()));

  //manually join chatRoom by chatId
  socket.on("joinChat", (chatId) => {
    socket.join(chatId);
    socket.data.chatId = chatId;
    socket.emit("chatId", chatId);
    console.log(`User ${socket.data.userId} joined chat ${chatId}`);
  });

socket.on("leaveChat", (chatId) => {
  socket.leave(chatId);
  socket.data.chatId = null;
  console.log(`User ${socket.data.userId} left chat ${chatId}`);
});

  //chat for sending real time msgs and saving
  socket.on("chat", async ({ chatId, text }) => {
    try {
      const msg = {
        chatId,
        sender: socket.data.userId,
        text: text,
      };

      const message = await Message.create(msg);

      //update last msg in Chat Collection for getting time and status on UI
      await Chat.findByIdAndUpdate(chatId, {
        lastMessage: message._id,
      });

      const payload = {
      _id: message._id,
      chatId,
      sender: {
        _id: socket.data.userId,
        username: socket.data.username,
      },
      text,
      deliveredTo: [],
      seenBy: [],
      messageType: message.messageType,
      mediaUrl: message.mediaUrl,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
    };
      io.to(chatId).emit("chat", payload)

 

    } catch (error) {
      console.log("error in saving msg", error);
    }
  });

  //messageDeliver status from receiver, receiver emit the event to update msg delivery
socket.on("messageDelivered", async ({ messageId }) => {
  const userId = socket.data.userId;

  const msg = await Message.findById(messageId).select("sender chatId");
  if (!msg) return;

  
  if (msg.sender.toString() === userId) return;

  await Message.updateOne(
    { _id: messageId },
    { $addToSet: { deliveredTo: userId } }
  );
const chatId = msg.chatId.toString();
 io.to(chatId).emit("messageDeliveredUpdate", {
     chatId,
      messageId,
      userId,
    });
  
});


 
  socket.on("messageSeen", async ({ messageId }) => {
  try {
    const userId = socket.data.userId;

    const message = await Message.findById(messageId);
    if (!message) return;

    if (message.sender.toString() === userId) return;

    await Message.updateOne(
      { _id: messageId, seenBy: { $ne: userId } },
      { $addToSet: { seenBy: userId } }
    );

    socket.to(message.chatId.toString()).emit("messagesSeenUpdate", {
      messageId,
      viewer: {
        id: userId,
        username: socket.data.username
      }
    });

  } catch (err) {
    console.error("Error updating seen messages:", err);
  }
});


  socket.on("disconnect", () => {
    const userId = socket.data.userId;

    if (!userId || !onlineUser.has(userId)) {
      console.log(`Unknown socket disconnected: ${socket.id}`);
      return;
    }

    // Remove ONLY this disconnected socket
    const sockets = onlineUser.get(userId);
    const updatedSockets = sockets.filter(id => id !== socket.id);

    if (updatedSockets.length === 0) {
      // No tabs left user truly offline
      onlineUser.delete(userId);
      console.log(` ${userId} fully disconnected`);
    } else {
      // User still has other tabs open  keep online
      onlineUser.set(userId, updatedSockets);
      console.log(` ${userId} closed one tab, still online`);
    }

    io.emit("online_users", Array.from(onlineUser.keys()));
  });
}
