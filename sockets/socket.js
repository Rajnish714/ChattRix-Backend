import { Message } from "../src/models/message.model.js";
import {User} from "../src/models/user.model.js";
import { Chat } from "../src/models/chat.model.js";
import { socketAuth } from "../src/midlleware/socket.auth.middleware.js";


const onlineUser= new Map()

 async function listen(io){

  io.use(socketAuth);
  io.on("connection", async socket=>{

   const userId = socket.data.userId;
     
    console.log("user Conneted= ",socket.id);
  

 const user = await User.findById(userId).select("username");
      if (!user) return socket.disconnect();

 onlineUser.set(userId, socket.id);
      socket.data.userId = userId;
      socket.data.username = user.username;

      console.log(`🟢 ${userId} connected (${socket.id})`);
   
    io.emit("online_users", Array.from(onlineUser.keys())); 
    

  
  
  

    socket.on("joinChat",(chatId)=>{
        
   
      socket.join(chatId)
      socket.data.chatId = chatId;  
      socket.emit("chatId",chatId)
       console.log(`User ${socket.data.userId} joined chat ${chatId}`);
  
    })
   
    socket.on("chat", async ({chatId,text})=>{
      try{
      const msg={
           chatId,
          sender: socket.data.userId,
          text: text,
      }
     const message = await Message.create(msg);

         await Chat.findByIdAndUpdate(chatId, {
          lastMessage: message._id,
        });
   
      io.to(chatId).emit("chat",{_id:message._id,chatId,senderId:socket.data.userId, senderName: socket.data.username,text,createdAt: message.createdAt})
    }
    catch(err){
      console.log("error in saving msg",err);
    }
    })


    


  socket.on("disconnect",() =>{
   const userId = socket.data.userId; // saved earlier
      if (userId && onlineUser.has(userId)) {
        onlineUser.delete(userId);
        console.log(`🔴 ${userId} disconnected`);
        io.emit("online_users", Array.from(onlineUser.keys()));
      } else {
        console.log(`❌ Unknown socket disconnected: ${socket.id}`);
      }
})

})


}




export default listen