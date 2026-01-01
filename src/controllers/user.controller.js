import { User } from "../models/user.model.js";
import { catchAsync } from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import { paginate } from "../utils/pagination.js";
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

export const searchUsers=catchAsync(async(req,res,next)=>{
   const myId = req.user.userId;
  if(!myId ) return next(new AppError("userId is required", 400));
 
  const { q = "", page = 1, limit = 10 } = req.query;
   if (!q.trim()) {
    return res.status(200).json({
      users: [],
      hasMore: false,
      pagination: null,
    });
  }
  
   const regex = new RegExp(q, "i");

   const userFilter = {
    username: regex,
    _id: { $ne: myId }  
  };
     
  const result = await paginate(
    User,
    userFilter,
    page,
    limit,
    "_id username profilePic"
  );

   res.status(200).json({
    message: "Search results fetched successfully",
    users: result.data,
    hasMore: result.pagination.hasNextPage,
    pagination: result.pagination,
  });
 })

 export const updateMyProfile = catchAsync(async (req, res, next) => {
  const userId = req.user.userId;
  const updates = {};


  if (req.body.username) {
    updates.username = req.body.username;
  }


  if (req.file) {
    updates.profilePic = await uploadImage({
      file: req.file,
      folder: "chattrix/users",
    });
  }

  if (Object.keys(updates).length === 0) {
    return next(new AppError("Nothing to update", 400));
  }

  const user = await User.findByIdAndUpdate(
    userId,
    updates,
    { new: true }
  ).select("username profilePic");

  res.json({ data: user });
});