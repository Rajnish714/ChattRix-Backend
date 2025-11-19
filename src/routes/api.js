import express from "express"


 import usersRouter from "./users/users.router.js"
import messagesRouter from "./messages/messages.router.js";
const api = express.Router();

api.use("/users", usersRouter);
api.use("/messages", messagesRouter);

export default api;