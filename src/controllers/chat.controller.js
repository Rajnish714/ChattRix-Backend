import { Chat } from "../models/chat.model.js";
import { catchAsync } from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import { io } from "../../server.js";


export const getorCreatePrivateChatId=catchAsync(async (req, res, next) => {
   
    const {otherUserId}= req.body
    const myId = req.user.userId;

    if(!otherUserId) return next(new AppError("otherUserId is required", 400));
    
     let chat = await Chat.findOne({
      isGroup: false,
      members: { $all: [myId, otherUserId] },
    });

    if(!chat) {
      chat = await Chat.create({
        isGroup: false,
        members: [myId, otherUserId],
      });
    }
    res.status(200).json(chat);
    } 
    )

//--------------CREATE GROUP---------------------------------4
  
export const createGroup=catchAsync(async (req, res, next) =>{

   const myId = req.user.userId;
   const { imageUrl,groupName,members } = req.body;
   
    if(!myId ) return next(new AppError("userId is required", 400));
    if (!groupName) return next(new AppError("Group name is required", 400));
  
   const finalMembers = Array.isArray(members) ? members : [members];
   const newGroup= await Chat.create({
      isGroup:true,
      createdBy:myId,
      admins:[myId],
      members: [myId, ...finalMembers],
      groupName,
      groupImage: imageUrl || undefined, 
      
    });

    res.status(201).json({message:"group created successfully",data:newGroup})
    })

//--------------get my group ---------------------------------

export const getMyGroup=catchAsync(async (req, res, next) =>{
   const myId = req.user.userId;
      
  if(!myId ) return next(new AppError("userId is required", 400));
      
    const groups = await Chat.find({
    isGroup: true,
    members: { $in: [myId] }   
  })
  .populate("members", "username profilePic") 
  .populate("admins", "username")
  .sort({ updatedAt: -1 }); 

   if(!groups) return next(new AppError("groups not found", 404));
  
   res.status(200).json({ 
   message: "Groups fetched successfully",
   data: groups
   })
 })

//--------------Add group member---------------------------------

export const addGroupMember=catchAsync(async (req, res, next) =>{
    
    const { chatId } = req.query;
    const myId = req.user.userId;
    const {  members } = req.body;
  
    if(!myId ) return next(new AppError("userId is required", 400))
    if(!chatId || !members) return next(new AppError("chatId and members is required", 400));
 
    const group= await Chat.findById(chatId)
    if(!group) return next(new AppError("group not found", 404));
    
    if(!group.isGroup) return next(new AppError("Cannot add members to a 1v1 chat", 400));
    if(!group.admins.some(id => id.toString() === myId)) return next(new AppError("Only admins can add members", 403));
       
    const finalMembers = Array.isArray(members) ? members : [members];
  
    const newMember=await Chat.findByIdAndUpdate(chatId, {
    $addToSet: { members: {$each: finalMembers} }},{new: true}
  ).populate("members", "username profilePic").populate("admins", "username")

    res.status(200).json({message:"members added successfully",data:newMember})
    io.to(chatId).emit("memberAdded", {chatId, member: newMember});
   })

//--------------Remove group member---------------------------------

export const removeGroupMember = catchAsync(async (req, res, next) => {

    const { chatId } = req.query;
    const myId = req.user.userId;
    const { members } = req.body;

    if (!myId) return next(new AppError("userId is required", 400));
    if (!chatId || !members) return next(new AppError("chatId and members are required", 400));

    const group = await Chat.findById(chatId);
    if (!group) return next(new AppError("Group not found", 404));

    if (!group.isGroup) return next(new AppError("Cannot remove members from a 1v1 chat", 400));

    const isOwner = group.createdBy.toString() === myId;
    const isAdmin = group.admins.map(a => a.toString()).includes(myId);

    if (!isOwner && !isAdmin) return next(new AppError("Only owner or admins can remove members", 403));

    const finalMembers = Array.isArray(members) ? members : [members];

    const existingMembers = finalMembers.filter(memberId =>
      group.members.map(m => m.toString()).includes(memberId)
    );

    if (existingMembers.length === 0) return next(new AppError("User(s) not part of the group", 400));

    const ownerId = group.createdBy.toString();
    const adminIds = group.admins.map(a => a.toString());

    let removableMembers;

    if (isOwner) {
      if (existingMembers.includes(myId)) return next(new AppError("Owner cannot remove themselves. Transfer ownership first.", 400));
      
      removableMembers = existingMembers;
    } else {
      removableMembers = existingMembers.filter(id =>
        id !== ownerId &&
        !adminIds.includes(id) &&
        id !== myId
      );

      if (removableMembers.length === 0)
        return next(new AppError("Admins cannot remove owner, other admins, or themselves", 403));
    }
  
    await Chat.findByIdAndUpdate(chatId, {
      $pull: { members: { $in: removableMembers } }
    });

    if (isOwner) {
      await Chat.findByIdAndUpdate(chatId, {
        $pull: { admins: { $in: removableMembers } }
      });
    }

    const updatedGroup = await Chat.findById(chatId)
      .populate("members", "username profilePic")
      .populate("admins", "username");

    res.status(200).json({
      message: "Members removed successfully",
      removed: removableMembers,
      data: updatedGroup
    });

    io.to(chatId).emit("memberRemoved", {
      chatId,
      removedMembers: removableMembers
    });

  });

   //--------------add group admin---------------------------------

export const addGroupAdmin=catchAsync(async (req, res, next) =>{
    
    const { chatId } = req.query;
    const myId = req.user.userId;
    const {  members } = req.body;
  
    if(!myId ) return next(new AppError("userId is required", 400))
    if(!chatId || !members) return next(new AppError("chatId and members is required", 400));
 
    const group = await Chat.findById(chatId)
    if(!group) return next(new AppError("group not found", 404));
    
    if(!group.isGroup) return next(new AppError("Cannot add admins to a 1v1 chat", 400));
    if (group.createdBy.toString() !== myId) return next(new AppError("Only the group owner can add admins", 403));
         
    const finalMembers = Array.isArray(members) ? members : [members];
    
    const existingMembers = finalMembers.filter(memberId =>
    group.members.map(m => m.toString()).includes(memberId)
  );

    if(existingMembers.length === 0)return next(new AppError("User must be a group member to become admin", 400));

  const nonAdminMembers = existingMembers.filter(memberId =>
    !group.admins.map(a => a.toString()).includes(memberId)
  );

  if(nonAdminMembers.length === 0) return next(new AppError("User is already an admin", 400));
   
    const updatedGroup = await Chat.findByIdAndUpdate(chatId, {
    $addToSet: { admins: {$each: nonAdminMembers} }},
    {new: true}).populate("members", "username profilePic").populate("admins", "username");

    res.status(200).json({message:"admin added successfully",data:updatedGroup})
    io.to(chatId).emit("adminAdded", {chatId, addedAdmins: nonAdminMembers});
   })


   
   //--------------remove group admin---------------------------------

export const removeGroupAdmin=catchAsync(async (req, res, next) =>{
    
    const { chatId } = req.query;
    const myId = req.user.userId;
    const {  members } = req.body;
  
    if(!myId ) return next(new AppError("userId is required", 400))
    if(!chatId || !members) return next(new AppError("chatId and members is required", 400));
 
    const group = await Chat.findById(chatId)
    if(!group) return next(new AppError("group not found", 404));
    
    if(!group.isGroup) return next(new AppError("Cannot remove admins to a 1v1 chat", 400));
    if (group.createdBy.toString() !== myId) return next(new AppError("Only the group owner can removes admins", 403));
         
    const finalMembers = Array.isArray(members) ? members : [members];
    
    const existingMembers = finalMembers.filter(memberId =>
    group.members.map(m => m.toString()).includes(memberId)
  );

    if(existingMembers.length === 0)return next(new AppError("User must be a group member to remove admin", 400));

  const adminMembers = existingMembers.filter(memberId =>
    group.admins.map(a => a.toString()).includes(memberId)
  );

  if(adminMembers.length === 0) return next(new AppError("User is not an admin", 400));

  const ownerId = group.createdBy.toString();
  const removableAdmins = adminMembers.filter(id => id !== ownerId);

  if (removableAdmins.length === 0)
    return next(new AppError("Owner cannot be removed as admin", 400));
  
    const updatedGroup = await Chat.findByIdAndUpdate(chatId, {
    $pull: { admins: {$in: removableAdmins} }},
    {new: true}).populate("members", "username profilePic").populate("admins", "username");

    res.status(200).json({message:"admin removed successfully",data:updatedGroup})
    io.to(chatId).emit("adminRemoved", {chatId, removedAdmins: removableAdmins});
   })
