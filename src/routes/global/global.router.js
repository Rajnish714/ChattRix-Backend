 import express from "express"
 import { searchAll} from "../../controllers/global.controller.js"
  import { verifyAccessToken } from "../../midlleware/auth.middleware.js"
 
 const globalRouter=express.Router()

globalRouter.get("/",verifyAccessToken, searchAll)


 export default globalRouter