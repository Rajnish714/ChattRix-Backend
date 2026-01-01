import express from "express"
import { getorCreatePrivateChatId,createGroup, addGroupMember,getMyGroups,getAllChats,removeGroupMember,addGroupAdmin,removeGroupAdmin, leaveGroup  } from "../../controllers/chat.controller.js"
import { verifyAccessToken } from "../../midlleware/auth.middleware.js"
import { uploadImage } from "../../midlleware/upload.middleware.js"
const chatRouter = express.Router()


chatRouter.get("/get-groups",verifyAccessToken,getMyGroups)
chatRouter.get("/get-allchat",verifyAccessToken,getAllChats)

chatRouter.post("/private",verifyAccessToken,getorCreatePrivateChatId)
chatRouter.post("/create-group",verifyAccessToken,uploadImage.single("image"),createGroup)
chatRouter.post("/leave-group",verifyAccessToken,leaveGroup)

chatRouter.patch("/add-member",verifyAccessToken,addGroupMember)
chatRouter.patch("/add-admin",verifyAccessToken,addGroupAdmin)

chatRouter.delete("/remove-admin",verifyAccessToken,removeGroupAdmin)
chatRouter.delete("/remove-member",verifyAccessToken,removeGroupMember)




export default chatRouter