import express from "express"
import authRouter from "./auth/auth.router.js";
import usersRouter from "./users/users.router.js"
import messagesRouter from "./messages/messages.router.js";
import chatRouter from "./chat/chat.router.js"
import globalRouter from "./global/global.router.js"

const api = express.Router();

api.use("/auth",authRouter)
api.use("/users", usersRouter);
api.use("/messages", messagesRouter);
api.use("/chat", chatRouter);
api.use("/search", globalRouter);


export default api;