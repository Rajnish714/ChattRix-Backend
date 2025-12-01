import { Message } from "../src/models/message.model.js";
import {User} from "../src/models/user.model.js";
import { Chat } from "../src/models/chat.model.js";
import { socketAuth } from "../src/midlleware/socket.auth.middleware.js";


const onlineUser= new Map()

 async function listen(io){

//socket middleware to check accesstoken  
  io.use(socketAuth);


  io.on("connection", async socket=>{
   const userId = socket.data.userId;
   console.log("user Conneted= ",socket.id);
  
//fetch username and check user for gloabal use
 const user = await User.findById(userId).select("username");
      if (!user) return socket.disconnect();


  //auto join connect socket to all chatId so delivered msg work globally
  const userChats = await Chat.find({ members: userId }).select("_id");
      userChats.forEach(chat => {
      socket.join(chat._id.toString());
      } 
  );

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
      socket.on("joinChat",(chatId)=>{
        socket.join(chatId)
        socket.data.chatId = chatId;  
        socket.emit("chatId",chatId)
        console.log(`User ${socket.data.userId} joined chat ${chatId}`);
  
      }
    )

    //chat for sending real time msgs and saving
    socket.on("chat", async ({chatId,text})=>{
      try{
      const msg={
          chatId,
          sender: socket.data.userId,
          text: text,
      }
     const message = await Message.create(msg);

//update last msg in Chat Collection for getting time and status on UI
         await Chat.findByIdAndUpdate(chatId, {
          lastMessage: message._id,
        });
   

      io.to(chatId).emit("chat",{_id:message._id,chatId,senderId:socket.data.userId, senderName: socket.data.username,text,createdAt: message.createdAt})
    }
    catch(error){
      console.log("error in saving msg",error);
    }
    })

    //messageDeliver status from receiver, receiver emit the event to update msg delivery
    socket.on("messageDelivered", async ({ messageId }) => {
    try{
       const userId = socket.data.userId;
      await Message.updateOne({ _id: messageId }, { $addToSet: { deliveredTo: userId } });
      
      const msg = await Message.findById(messageId).select("sender");
      const senderId = msg.sender.toString();
      const senderSocket = onlineUser.get(senderId);
      
      if (senderSocket) {
      io.to(senderSocket).emit("messageDeliveredUpdate",{
        messageId,
        deliveredTo:socket.data.username
        }
      );
    }
    }catch(error){
     console.log("error in Deliver message",error);
    }
  }
);

//msgSeen emit by receiver
socket.on("messageSeen", async (chatId) => {
  try {
    const userId = socket.data.userId;
//mongodb logic this logic prevent duplicate data in SeenBy array
     await Message.updateMany(
    {chatId, seenBy: { $ne: userId }},//ne means not equal condition
    {$addToSet: { seenBy: userId }}//addtoset  prevents duplicates
    );
    
//get all unique senderId in this msg collection by chatId

  const senders = await Message.distinct("sender", { chatId });

//convert senderId to string run loop for fetch all socketid

    senders.forEach(senderId => {
      senderId = senderId.toString();

      if (senderId === userId) return; 

      const senderSocket = onlineUser.get(senderId);
      //send to specify user 
      if (senderSocket) {
        io.to(senderSocket).emit("messagesSeenUpdate", {
          chatId,
           viewer: {
            id: userId,
            username: socket.data.username
          }
        });
      }
    });

  } catch (err) {
    console.error("Error updating seen messages:", err);
  }
});
    


socket.on("disconnect", () => {
  const userId = socket.data.userId;

  if (!userId || !onlineUser.has(userId)) {
    console.log(`❌ Unknown socket disconnected: ${socket.id}`);
    return;
  }

  // Remove ONLY this disconnected socket
  const sockets = onlineUser.get(userId);
  const updatedSockets = sockets.filter(id => id !== socket.id);

  if (updatedSockets.length === 0) {
    // No tabs left → user truly offline
    onlineUser.delete(userId);
    console.log(`🔴 ${userId} fully disconnected`);
  } else {
    // User still has other tabs open → keep online
    onlineUser.set(userId, updatedSockets);
    console.log(`🟡 ${userId} closed one tab, still online`);
  }

  io.emit("online_users", Array.from(onlineUser.keys()));
})

})


}




export default listen