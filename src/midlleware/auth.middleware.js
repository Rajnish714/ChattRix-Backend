 import  jwt  from "jsonwebtoken"
 const ACCESS_TOKEN_SECRET= process.env.ACCESS_TOKEN_SECRET

 export const verifyAccessToken = (req,res,next)=>{
const authHeader= req.headers['authorization']
const token = authHeader && authHeader.split(' ')[1];

if(!token){
      return res.status(401).json({ message: "Access token missing" });
}
try{
       const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
     
       req.user = {userId:decoded.userId}
       
       next()
}catch(error){
    console.log(error)
 return res.status(401).json({ message: "Invalid or expired token" });
}
 }