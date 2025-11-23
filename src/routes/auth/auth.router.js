import express from "express"
import { login,signup,refreshToken} from "../../controllers/auth.controller.js"
const authRouter = express.Router()
authRouter.post("/signup",signup)
authRouter.post("/login",login)
authRouter.post("/refresh-token",refreshToken)

export default authRouter