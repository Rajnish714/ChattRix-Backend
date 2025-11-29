import express from "express"
import { getMessages } from "../../controllers/message.controller.js"
import { verifyAccessToken } from "../../midlleware/auth.middleware.js"
const messagesRouter = express.Router()

messagesRouter.get("/",verifyAccessToken,getMessages)

export default messagesRouter