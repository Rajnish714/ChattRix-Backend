import { Chat } from "../models/chat.model.js";
import { User } from "../models/user.model.js";
import { catchAsync } from "../utils/catchAsync.js";
import { paginate } from "../utils/pagination.js";
import AppError from "../utils/AppError.js";

//--------------search groups ---------------------------------

export const searchAll=catchAsync(async (req, res, next) =>{
   const myId = req.user.userId;
  if(!myId ) return next(new AppError("userId is required", 400));

   const { q = "", page = 1, limit = 10 } = req.query;
   const regex = new RegExp(q, "i");


   const userFilter = {
    username: regex,
    _id: { $ne: myId }  
  };

    const groupFilter = {
    isGroup: true,
    members: { $in: [myId] },  
    groupName: regex
  };
      
    const [usersResult, groupsResult] = await Promise.all([
    paginate(User, userFilter, page, limit, "username profilePic"),
    paginate(Chat, groupFilter, page, limit, "members admins", { updatedAt: -1 })
  ]);

    res.status(200).json({
    message: "Search results fetched successfully",
    users: usersResult.data,
    groups: groupsResult.data,
    pagination: {
      users: usersResult.pagination,
      groups: groupsResult.pagination
    }
   })
 })
