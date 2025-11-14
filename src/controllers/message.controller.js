import { Message } from "../models/message.model.js";
//import {User} from "../src/models/user.model.js";

export const getMessages = async(req,res)=>{
try{
        const { receiver, sender } = req.query; // <-- Important

    if (!receiver || !sender) {
      return res.status(400).json("Both users are required");
    }

    const message=await Message.find({
      $or: [
       
       
       
         { sender: receiver, receiver: sender },
         { sender: sender, receiver: receiver }
      ]
    }).sort({ createdAt: 1 });
    if(!message){
        res.status("401").json("messages not found")
        
    }
    res.status(201).json(message)

}catch(err){
res.status(200).json("error in getting messages")
}


}