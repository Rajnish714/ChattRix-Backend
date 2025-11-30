import express from "express"
import { getorCreatePrivateChatId } from "../../controllers/chat.controller.js"
import { verifyAccessToken } from "../../midlleware/auth.middleware.js"

const chatRouter = express.Router()

chatRouter.post("/private",verifyAccessToken,getorCreatePrivateChatId)

export default chatRouter