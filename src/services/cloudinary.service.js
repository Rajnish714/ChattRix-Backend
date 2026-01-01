import { v2 as cloudinary } from "cloudinary";
// import { CloudinaryStorage } from "multer-storage-cloudinary";


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

// export const cloudinaryStorage = new CloudinaryStorage({
//   cloudinary,
//   params: async (_req, file) => ({
//     folder: "chattrix/images",
//     resource_type: "image", // ✅ FORCE image-only
//     allowed_formats: ["jpg", "jpeg", "png", "webp"],
//     public_id: `${Date.now()}-${file.originalname.split(".")[0]}`,
//     transformation: [
//       { width: 500, height: 500, crop: "limit", quality: "auto" },
//     ],
//   }),
// });