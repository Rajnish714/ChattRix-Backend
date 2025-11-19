import {User} from "../models/user.model.js"
import bcrypt from 'bcrypt';
const saltRounds = 10;


export async function getUsers(req, res) {
  try {
    const users = await User.find();

    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    res.status(200).json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}


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

  if( !email || !password){
    return res.status(400).json({ message: "All fields are required" });
  }

 const user= await User.findOne({email})
const isMatch = await bcrypt.compare(password, user.password);
if (!isMatch) return res.status(400).send('Invalid credentials');

res.status(201).json({ user,message: "Login successful" });
}catch(error){
  console.log(error);
   res.status(500).json({ message: "Internal server error" });
}
}