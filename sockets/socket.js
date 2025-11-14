import { Message } from "../src/models/message.model.js";
// import {User} from "../src/models/user.model.js"

const onlineUser= new Map()


 async function listen(io){

  io.on("connection",socket=>{
    console.log("user Conneted= ",socket.id);
socket.on("assign",selectuser=>{
  onlineUser.set(selectuser,socket.id)
  socket.data.username = selectuser;
   console.log(`🟢 ${selectuser} connected (${socket.id})`);

   socket.emit("assigned",  selectuser );
    io.emit("online_users", Array.from(onlineUser.keys())); 
    
})
  
  
  

    socket.on("joinChat",(userId)=>{
      const room = [socket.data.username, userId].sort().join("_")
     
   
      socket.join(room)
      socket.emit("room",room)
       console.log(room,"ye hai");
  
    })
   
    socket.on("chat", async ({senderId,receiverid,groupId,room,text})=>{
      try{
      const msg={
          sender: senderId,
          receiver:receiverid ,
          groupId:groupId ,  
           text: text,
      }
       await Message.insertOne(msg)
      io.to(room).emit("chat",{senderId,text})
    }
    catch(err){
      console.log("error in saving msg",err);
    }
    })


    


  socket.on("disconnect",() =>{
   const username = socket.data.username; // saved earlier
      if (username && onlineUser.has(username)) {
        onlineUser.delete(username);
        console.log(`🔴 ${username} disconnected`);
        io.emit("online_users", Array.from(onlineUser.keys()));
      } else {
        console.log(`❌ Unknown socket disconnected: ${socket.id}`);
      }
})
})


}




export default listen