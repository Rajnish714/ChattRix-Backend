import {User} from "../models/user.model.js"
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import {generateTokens} from "../services/auth.service.js"
import {Auth} from "../models/auth.model.js"
const saltRounds = 10;

const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET;


export async function signup(req,res) {
  try{
  const{username,email,password}=req.body

  if(!username || !email|| !password){
    return res.status(400).json({ message: "All fields are required" });
  }
const hashedPassword = await bcrypt.hash(password, saltRounds);
  const newUser=new User({
    username,
    email,
    password: hashedPassword
  })
 const user= await newUser.save()
res.status(201).json({ user,message: "Signup successful" });
}catch(error){
  console.log(error);
   res.status(500).json({ message: "Internal server error" });
}
}



export async function login(req,res) {
  try{
  const{email,password}=req.body
console.log(email,password);
  if( !email || !password){
    return res.status(400).json({ message: "All fields are required" });
  }

 const user= await User.findOne({email})
const isMatch = await bcrypt.compare(password, user.password);
if (!isMatch) return res.status(400).send('Invalid credentials');


const {accessToken,refreshToken}= await generateTokens(user._id)

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path:"/"
    });


  res.json({
      message: "Login successful",
      accessToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
}catch(error){
  console.log(error);
   res.status(500).json({ message: "Internal server error" });
}
}

export async function refreshToken(req,res) {
   
    try{
 const refreshToken = req.cookies?.refreshToken

 if(!refreshToken){
       return res.status(401).json({ message: "No refresh token provided" });
 }
   let decoded;
    try {
      
      decoded = jwt.verify(refreshToken, REFRESH_SECRET);
       
    } catch (error) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }


console.log("Decoded userId:", decoded.userId, typeof decoded.userId);

let tokenData = await Auth.findOne({ userId: decoded.userId }); 
console.log("TokenData using string:", tokenData);


    if(!tokenData){
         return res.status(403).json({ message: " Refresh token not found" });
    }

    const isValidRT= await bcrypt.compare(refreshToken,tokenData.refreshTokenHash)
    if (!isValidRT) {
      return res.status(403).json({ message: "Refresh token mismatch" });
    }

   const { accessToken, refreshToken: newRefreshToken } = await generateTokens(decoded.userId);

  
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

    }catch(error){
        res.status(500).json({ message: "Internal server error" });
    }
}