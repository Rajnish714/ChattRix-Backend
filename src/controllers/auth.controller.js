import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { catchAsync } from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import { generateTokens } from "../services/auth.service.js";
import { Auth } from "../models/auth.model.js";
import { Otp } from "../models/otp.model.js";
import { sendOTP,verifyOTPService } from "../services/otp.services.js";
import { createHash,compareHash } from "../utils/hash.js";


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
      message:"user fetched successfully",
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
  
    const passwordHash = await createHash(password)
    
    const {otpSession}= await sendOTP(email,"register",{
    username,
    passwordHash,
  })

    res.json({
    message: "OTP sent to your email",
    otpSession,
  });

})
export const verifyOTP = catchAsync(async (req, res, next) => {
  const { otp, otpSession } = req.body;

  if (!otp || !otpSession) {
    return next(new AppError("OTP and session required", 400));
  }

  const result = await verifyOTPService(otp, otpSession);
 

  const { email, type, signupData } = result;

   if (type !== "register") {
    return next(new AppError("Invalid OTP type", 400));
  }

  const { username, passwordHash } = signupData;

  const user = await User.create({
    email,
    username,
    password: passwordHash,
    isVerified: true,
  });

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
  if (!otpSession) return next(new AppError("OTP session required", 400));

  const record = await Otp.findById(otpSession);
  if (!record || record.used) {
    return next(new AppError("OTP session invalid or expired", 400));
  }

  const { email, type, signupData } = record;

   record.used = true;
  await record.save();

  const {otpSession:newSession} = await sendOTP(email, type, signupData);

  res.json({
    message: "OTP resent successfully",
    otpSession: newSession,
  });
});

export const forgetPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  if (!email) return next(new AppError("Email required", 400));

  const user = await User.findOne({ email });
  if (!user) return next(new AppError("User not found", 404));

  const {otpSession} = await sendOTP(email, "forgot");

  res.json({
    message: "OTP sent",
    otpSession,
  });
});

export const resetPassword = catchAsync(async (req, res, next) => {
  const { otp, otpSession, newPassword } = req.body;

  if (!otp || !otpSession || !newPassword) {
    return next(new AppError("All fields required", 400));
  }

  const result = await verifyOTPService(otp, otpSession);
  
  if ( result.type !== "forgot") {
    return next(new AppError("Invalid OTP", 400));
  }

  const passwordHash = await createHash(newPassword)

  await User.updateOne(
    { email: result.email },
    { password: passwordHash }
  );

  res.json({ message: "Password updated successfully" });
});



export const login=catchAsync(async (req, res, next) => {

    const { email, password } = req.body;
    if (!email || !password) {
      return next(new AppError("all field are required", 400));
    }

    const user = await User.findOne({ email }).select("+password");
     if (!user) return next(new AppError("Invalid credentials", 401))

    const isMatchPassword = await compareHash(password,user.password) 
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




export const refreshToken=catchAsync(async (req, res, next) => {
  
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return next(new AppError("Refresh token required", 401));
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

    const isValidRT = await compareHash( refreshToken, tokenData.refreshTokenHash) 
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