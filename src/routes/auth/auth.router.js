import express from "express"
import { getCurrentUser,login,signup,logout,refreshToken,verifyOTP,resendOtp, forgetPassword, resetPassword} from "../../controllers/auth.controller.js"
import { verifyAccessToken } from "../../midlleware/auth.middleware.js"
import { signupSchema,loginSchema,validate } from "../../midlleware/validation.middleware.js"

const authRouter = express.Router()
authRouter.get("/me",verifyAccessToken,getCurrentUser)

authRouter.post("/verify-otp", verifyOTP);
authRouter.post("/resend-otp", resendOtp);
authRouter.post("/forgot-password", forgetPassword);
authRouter.post("/reset-password", resetPassword);
authRouter.post("/signup",validate(signupSchema),signup)
authRouter.post("/login",validate(loginSchema),login)
authRouter.post("/logout",verifyAccessToken,logout)
authRouter.post("/refresh-token",refreshToken)

export default authRouter