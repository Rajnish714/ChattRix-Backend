import express from "express"
import { getorCreatePrivateChatId,createGroup, addgroupMember,getMygroup } from "../../controllers/chat.controller.js"
import { verifyAccessToken } from "../../midlleware/auth.middleware.js"

const chatRouter = express.Router()

chatRouter.post("/private",verifyAccessToken,getorCreatePrivateChatId)
chatRouter.post("/create-group",verifyAccessToken,createGroup)
chatRouter.get("/get-groups",verifyAccessToken,getMygroup)
chatRouter.post("/add-member/",verifyAccessToken,addgroupMember)





export default chatRouter