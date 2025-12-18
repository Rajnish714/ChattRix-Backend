import { socketAuth } from "./middleware/socket.auth.middleware.js";
import { registerSocketHandlers } from "./handlers/socket.chat.handler.js";

export default function listen(io) {

  //socket middleware to check accesstoken  
  io.use(socketAuth);

  io.on("connection", async (socket) => {
    await registerSocketHandlers(io, socket);
  });

}


