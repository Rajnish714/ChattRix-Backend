
import { Message } from "../../src/models/message.model.js";
import { User } from "../../src/models/user.model.js";
import { Chat } from "../../src/models/chat.model.js";
import { onlineUser, autoJoinUserChats } from "../utils/socket.utils.js";

export async function registerSocketHandlers(io, socket) {

  socket.on("messageDelivered", async ({ messageId }) => {
    const userId = socket.data.userId;
    if (!userId) return;

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
    const userId = socket.data.userId;
    if (!userId) return;

    const message = await Message.findById(messageId);
    if (!message) return;

    if (message.sender.toString() === userId) return;

    await Message.updateOne(
      { _id: messageId },
      { $addToSet: { seenBy: userId } }
    );

    const chatId = message.chatId.toString();
    socket.to(chatId).emit("messagesSeenUpdate", {
      chatId,
      messageId,
      viewerId: userId,
    });
  });


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


  socket.on(
    "chat",
    async ({ chatId, messageType = "text", text = "", mediaUrl = null }) => {
      try {
        const msg = {
          chatId,
          messageType,
          mediaUrl,
          sender: socket.data.userId,
          text,
        };

        const message = await Message.create(msg);

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

        io.to(chatId).emit("chat", payload);
      } catch (error) {
        console.log("error in saving msg", error);
      }
    }
  );


  socket.on("disconnect", () => {
    const userId = socket.data.userId;
    if (!userId || !onlineUser.has(userId)) return;

    const sockets = onlineUser.get(userId);
    const updatedSockets = sockets.filter((id) => id !== socket.id);

    if (updatedSockets.length === 0) {
      onlineUser.delete(userId);
      console.log(` ${userId} fully disconnected`);
    } else {
      onlineUser.set(userId, updatedSockets);
      console.log(` ${userId} closed one tab, still online`);
    }

    io.emit("online_users", Array.from(onlineUser.keys()));
  });



  const userId = socket.data.userId;

  const user = await User.findById(userId).select("username");
  if (!user) {
    socket.disconnect();
    return;
  }

  socket.join(userId);
  await autoJoinUserChats(socket, userId);

  if (!onlineUser.has(userId)) {
    onlineUser.set(userId, []);
  }
  onlineUser.get(userId).push(socket.id);

  socket.data.userId = userId;
  socket.data.username = user.username;

  console.log(` ${userId} connected (${socket.id})`);

  io.emit("online_users", Array.from(onlineUser.keys()));
}
