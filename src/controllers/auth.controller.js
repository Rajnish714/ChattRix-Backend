import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { catchAsync } from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import { generateTokens } from "../services/auth.service.js";
import { Auth } from "../models/auth.model.js";
import { Otp } from "../models/otp.model.js";
import { sendOTP,verifyOTPService } from "../services/otp.services.js";


const saltRounds = 10;

const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET;

export const getCurrentUser=catchAsync(async (req, res, next) => {
  
    const userId = req.user.userId;
    if (!userId) {
      return next(new AppError("user id is required", 400));
    }
    const user = await User.findById(userId);
    if (!user) {
      return next(new AppError("user not found", 404));
    }
    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });

}
)

export const signup=catchAsync(async (req, res, next) => {
 
  const { username, email,password} = req.body;
    
   if(!username || !email || !password) return next(new AppError("all field are required", 400));
    
   const existing = await User.findOne({ email });
   if (existing) return next(new AppError("Email already registered", 400));
  
    const {otpSession}= await sendOTP(email,"register")

    res.json({
    message: "OTP sent to your email",
    signupData: { username, email , otpSession},
  });

})

export const verifyOTP = catchAsync(async (req, res, next) => {
  const { otp, username, password, otpSession } = req.body;
  
  const result = await verifyOTPService(otp, otpSession);

   if (!result.success) {
    return next(new AppError(result.message, 400));
  }
 const { email, type } = result;
  let responsePayload={}

if(type==="register"){
 if( !username || !password ){ return next(new AppError("username password required", 400));}
   const hashedPassword = await bcrypt.hash(password, saltRounds);
    const user = await User.create({
    username,
    email,       
    password: hashedPassword,
    isVerified: true,
  });

     responsePayload = {
      message: "Signup successful",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    };
   await Otp.deleteMany({ email });
  res.json(responsePayload);
}
if(type==="forgot"){
  if(!password)return next( new AppError("password required"))
  const user = await User.findOne({ email }).select("+password");
  const isMatch = await bcrypt.compare(password, user.password);
  if (isMatch) return next(new AppError("New password cannot be the same as the old password. ",400))

    const hashedPassword = await bcrypt.hash(password, 10);

   await User.findByIdAndUpdate(user._id,
    {password:hashedPassword},
    {new:true})

    responsePayload={
      message:"password updated successfully",

    }
    await Otp.deleteMany({ email });
    res.json(responsePayload);
}

})

export const resendOtp = catchAsync(async (req, res, next) => {

    const { otpSession } = req.body;
 
    if(!otpSession)  return next(new AppError("OTP session required", 400));
    const record = await Otp.findById(otpSession);
  
    if (!record) return next(new AppError("Invalid OTP session", 400));
    const {email,type} = record
  
  const {otpSession: newSession}= await sendOTP(email,type)

   res.json({
    message: "OTP resent successfully",
    otpSession: newSession,
   });
});


export const login=catchAsync(async (req, res, next) => {

    const { email, password } = req.body;
    if (!email || !password) {
      return next(new AppError("all field are required", 400));
    }

    const user = await User.findOne({ email }).select("+password");
     if (!user) return next(new AppError("Invalid credentials", 401))

    const isMatchPassword = await bcrypt.compare(password, user.password);
    if (!isMatchPassword) return next(new AppError("Invalid credentials", 401))

    const { accessToken, refreshToken } = await generateTokens(user._id);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
    });

    res.json({
      message: "Login successful",
      accessToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
 
})

export const forgetPassword=catchAsync(async (req,res,next)=>{
  const {email} = req.body
  if(!email) return next(new AppError("email required",401))
  const user=await User.findOne({email})
  if(!user) return next(new AppError("user not found",401))
  const {otpSession}= await sendOTP(email,"forgot")
  res.status(200).json({
  message:"forgot request has been sent",
  otpSession
})

})

export const refreshToken=catchAsync(async (req, res, next) => {
  
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return next(new AppError("all field are required", 401));
    }
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, REFRESH_SECRET);
    } catch (error) {
      return  next(new AppError("Invalid refresh token", 403));
    }

    let tokenData = await Auth.findOne({ userId: decoded.userId });

    if (!tokenData) {
      return next(new AppError("Refresh token not found", 403));
    }

    const isValidRT = await bcrypt.compare(
      refreshToken,
      tokenData.refreshTokenHash
    );
    if (!isValidRT) {
      return next(new AppError("Refresh token mismatch", 403));
    }

    const { accessToken, refreshToken: newRefreshToken } = await generateTokens(
      decoded.userId
    );

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
    });

    return res.status(200).json({
      message: "New tokens generated",
      accessToken,
    });
 
})

export const logout=catchAsync(async (req, res, next) =>{
 
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
      let decode;
      try {
        decode = jwt.verify(refreshToken, REFRESH_SECRET);
      } catch (error) {
        decode = null;
      }
      if (decode?.userId) {
        await Auth.findOneAndDelete({ userId: decode.userId });
      }
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
    });
    res.json({ message: "Logged out successfully" });

}
)