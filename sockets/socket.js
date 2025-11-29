import { Message } from "../src/models/message.model.js";
import {User} from "../src/models/user.model.js";
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
    

  
  
  

    socket.on("joinChat",(receiverId)=>{
     const  roomId = [socket.data.userId, receiverId].sort().join("_")
     
   
      socket.join(roomId)
      socket.data.roomId = roomId;  
      socket.emit("room",roomId)
       console.log(roomId,"ye hai");
  
    })
   
    socket.on("chat", async ({receiverid,text})=>{
      try{
      const msg={
          sender: socket.data.userId,
          receiver:receiverid ,
           text: text,
      }
       await Message.create(msg);
      const roomId=socket.data.roomId
      io.to(roomId).emit("chat",{senderId:socket.data.userId, senderName: socket.data.username,text})
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