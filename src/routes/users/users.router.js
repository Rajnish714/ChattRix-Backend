 import express from "express"
 import { getUsers } from "../../controllers/user.controller.js"
 import { verifyAccessToken } from "../../midlleware/auth.middleware.js"
 
 const usersRouter=express.Router()
    
 usersRouter.get("/",verifyAccessToken, getUsers)

 export default usersRouter