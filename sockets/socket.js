import { Message } from "../src/models/message.model.js";
import {User} from "../src/models/user.model.js";

const onlineUser= new Map()

 async function listen(io){

  io.on("connection",socket=>{
    console.log("user Conneted= ",socket.id);
socket.on("assign", async userId=>{
  onlineUser.set(userId,socket.id)
  socket.data.userId = userId;

    const user = await User.findById(userId).select("username");
  socket.data.username = user.username;
   console.log(`🟢 ${userId} connected (${socket.id})`);


    io.emit("online_users", Array.from(onlineUser.keys())); 
    
})
  
  
  

    socket.on("joinChat",(userId)=>{
     const  roomId = [socket.data.userId, userId].sort().join("_")
     
   
      socket.join(roomId)
      socket.data.roomId = roomId;  
      socket.emit("room",roomId)
       console.log(roomId,"ye hai");
  
    })
   
    socket.on("chat", async ({senderId,receiverid,text})=>{
      try{
      const msg={
          sender: senderId,
          receiver:receiverid ,
           text: text,
      }
       await Message.create(msg);
      const roomId=socket.data.roomId
      io.to(roomId).emit("chat",{senderId, senderName: socket.data.username,text})
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