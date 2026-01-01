import cloudinary from "./cloudinary.service.js";

export const uploadImage = async ({
  file,
  folder,
  width = 500,
  height = 500,
}) => {
  if (!file) return null;

  const result = await cloudinary.uploader.upload(
    `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
    {
      folder,
      resource_type: "image",
      transformation: [
        { width, height, crop: "limit", quality: "auto" },
      ],
    }
  );

  return result.secure_url;
};