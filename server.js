
import "dotenv/config";
import app from"./app.js"
import http from "http"
import listen from "./sockets/index.js"
const server = http.createServer(app)
import {Server} from "socket.io"
import { connectDB } from "./src/config/config.js"


const PORT=process.env.PORT
export const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

async function onload() {
    try{
       
      await connectDB()
      
      listen(io)
       
       server.listen(PORT,()=>{
         console.log(`server has started at ${PORT}`);
       }
      )
   
    }catch(err){
        console.log(err,"something went wrong ");
    }
}

onload()



