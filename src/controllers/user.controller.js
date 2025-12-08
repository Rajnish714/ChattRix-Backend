import { User } from "../models/user.model.js";
import { catchAsync } from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
export const getUsers=catchAsync(async (req, res, next) => {

  const myId = req.user?.userId;

  if (!myId) {
    return next(new AppError("Unauthorized user", 401));
  }

  const users = await User.find({ 
    _id: { $ne: myId }    
  });

  if (!users || users.length === 0) {
    return next(new AppError("No users found", 404));
  }

  res.status(200).json({
    message: "Users fetched successfully",
    users
  });
})
