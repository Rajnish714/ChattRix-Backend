import express from "express"
import { getorCreatePrivateChatId,createGroup, addGroupMember,getMyGroup,removeGroupMember,addGroupAdmin,removeGroupAdmin  } from "../../controllers/chat.controller.js"
import { verifyAccessToken } from "../../midlleware/auth.middleware.js"

const chatRouter = express.Router()

chatRouter.post("/private",verifyAccessToken,getorCreatePrivateChatId)
chatRouter.post("/create-group",verifyAccessToken,createGroup)

chatRouter.patch("/add-member",verifyAccessToken,addGroupMember)
chatRouter.patch("/add-admin",verifyAccessToken,addGroupAdmin)

chatRouter.delete("/remove-admin",verifyAccessToken,removeGroupAdmin)
chatRouter.delete("/remove-member",verifyAccessToken,removeGroupMember)

chatRouter.get("/get-groups",verifyAccessToken,getMyGroup)



export default chatRouter