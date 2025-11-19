import { Message } from "../models/message.model.js";


export const getMessages = async(req,res)=>{
try{
        const { receiver, sender } = req.query;

    if (!receiver || !sender) {
      return res.status(400).json("Both users are required");
    }

   
    const message=await Message.find({
      $or: [
                     
         { sender: receiver, receiver: sender },
         { sender: sender, receiver: receiver }
      ]
    }).populate("sender", "username")
  .populate("receiver", "username")
  .sort({ createdAt: 1 });


    if(!message){
        res.status("401").json("messages not found")
        
    }
    res.status(201).json(message)

}catch(err){
res.status(200).json("error in getting messages")
}


}