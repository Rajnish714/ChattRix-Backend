 import express from "express"
 import { getUsers,signup,login } from "../../controllers/user.controller.js"
 
 const usersRouter=express.Router()
usersRouter.get("/",getUsers)
usersRouter.post("/signup",signup)
usersRouter.post("/login",login)

 export default usersRouter