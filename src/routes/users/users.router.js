 import express from "express"
 import { getUsers } from "../../controllers/user.controller.js"
 
 const usersRouter=express.Router()
usersRouter.get("/",getUsers)


 export default usersRouter