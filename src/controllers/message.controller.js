import { Message } from "../models/message.model.js";
import AppError from "../utils/AppError.js"
import { catchAsync } from "../utils/catchAsync.js";
import { paginate } from "../utils/pagination.js";


export const getMessages = catchAsync(async (req, res, next) => {
 
    const { chatId, page = 1, limit = 20 } = req.query;
   
    if (!chatId) return next(new AppError("chatId is required", 400));
    
    const filter = { chatId };
    const sort = { createdAt: -1 };
    
    const result = await paginate(
    Message,
    filter,
    page,
    limit,
    "sender",
    sort
   );

   res.status(200).json({
    message: "Messages fetched",
    messages: result.data,          
    pagination: result.pagination 
  });

})
