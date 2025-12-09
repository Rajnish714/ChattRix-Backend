import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { catchAsync } from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import { generateTokens } from "../services/auth.service.js";
import { Auth } from "../models/auth.model.js";
import { Otp } from "../models/otp.model.js";
import { sendOtpEmail } from "../utils/sendOtp.js";

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
  
   const otp = Math.floor(100000 + Math.random() * 900000).toString();
   const otpHash = await bcrypt.hash(otp, 10);
   
   await Otp.deleteMany({ email });
   const otpRecord =await Otp.create({
    email,
    otpHash,
    expiresAt: Date.now() + 5 * 60 * 1000, 
  });

    await sendOtpEmail(email, otp);

  res.json({
    message: "OTP sent to your email",
    signupData: { username, email , otpSession: otpRecord._id.toString()},
  });

})

export const verifyOtp = catchAsync(async (req, res, next) => {
  const { otp, username, password, otpSession } = req.body;
 
  if (!otp || !username || !password || !otpSession) return next(new AppError("All fields are required", 400));

 const record = await Otp.findById(otpSession); 
  if (!record) return next(new AppError("OTP session expired", 400));

  const email = record.email; 

  if (record.expiresAt < Date.now()) return next(new AppError("OTP expired", 400));
  
  const isMatch = await bcrypt.compare(otp, record.otpHash);
  if (!isMatch) return next(new AppError("Invalid OTP", 400));

  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const user = await User.create({
    username,
    email,       
    password: hashedPassword,
    isVerified: true,
  });

   await Otp.deleteMany({ email });

  res.json({
    message: "Signup successful",
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
    },
  });
});

export const resendOtp = catchAsync(async (req, res, next) => {

    const { otpSession } = req.body;
 
    if(!otpSession)  return next(new AppError("OTP session required", 400));
    const record = await Otp.findById(otpSession);
  
    if (!record) return next(new AppError("Invalid OTP session", 400));
    const email = record.email; 
 
    await Otp.deleteMany({ email });
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 10);

   const newRecord = await Otp.create({
      email,
      otpHash,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

   await sendOtpEmail(email, otp);
   res.json({
    message: "OTP resent successfully",
    otpSession: newRecord._id.toString(),
   });
});


export const login=catchAsync(async (req, res, next) => {

    const { email, password } = req.body;
    console.log(email, password);
    if (!email || !password) {
      return next(new AppError("all field are required", 400));
    }

    const user = await User.findOne({ email }).select("+password");
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).send("Invalid credentials");

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