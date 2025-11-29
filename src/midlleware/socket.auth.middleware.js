
import jwt from "jsonwebtoken"
const ACCESS_SECRET= process.env.ACCESS_TOKEN_SECRET
export function socketAuth(socket, next) {
  try {
    const token = socket.handshake.auth.token;

    if (!token) return next(new Error("No token"));

    const decoded = jwt.verify(token, ACCESS_SECRET);

    socket.data.userId = decoded.userId; 
    next(); 
  } catch (err) {
    next(new Error("Invalid token"));
  }
}