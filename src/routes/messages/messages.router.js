import express from "express"
import { getMessages } from "../../controllers/message.controller.js"
const messagesRouter = express.Router()

messagesRouter.get("/",getMessages)

export default messagesRouter