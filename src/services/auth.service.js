import jwt from "jsonwebtoken";
import { createHash} from "../utils/hash.js";
import {Auth} from "../models/auth.model.js";

const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET;

export const generateTokens = async (userId) => {
 
  const accessToken = jwt.sign({ userId: userId.toString() }, ACCESS_SECRET, { expiresIn: "15m" });
  const refreshToken = jwt.sign({ userId: userId.toString() }, REFRESH_SECRET, { expiresIn: "7d" });
  const hashedRT = await createHash(refreshToken);

  await Auth.findOneAndUpdate(
    { userId },
    {
      refreshTokenHash: hashedRT,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    },
    { upsert: true } 
  )

  return { accessToken, refreshToken };
};