import express from "express"
import { getCurrentUser,login,signup,refreshToken} from "../../controllers/auth.controller.js"
import { verifyAccessToken } from "../../midlleware/auth.middleware.js"
const authRouter = express.Router()
authRouter.get("/me", verifyAccessToken,getCurrentUser)
authRouter.post("/signup",signup)
authRouter.post("/login",login)
authRouter.post("/refresh-token",refreshToken)

export default authRouter