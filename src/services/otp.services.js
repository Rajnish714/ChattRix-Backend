import { Otp } from "../models/otp.model.js"
import { createHash,compareHash } from "../utils/hash.js";
import { sendOTPEmail } from "../utils/sendOtp.js";
export async function sendOTP(email,type,signupData = null) {
  await Otp.deleteMany({ email, type, used: false });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpHash = await createHash(otp);

  const newRecord = await Otp.create({
    email,
    otpHash,
    type,
    ...(signupData && { signupData }),
    expiresAt: Date.now() + 5 * 60 * 1000,
  });
  await sendOTPEmail(email, otp);
  return {  otpSession: newRecord._id.toString() };
}

export async function verifyOTPService(otp, otpSessionId) {
  const session = await Otp.findOne({
    _id: otpSessionId,
    used: false,
    expiresAt: { $gt: new Date() },
  });

  if (!session) {
    throw new Error("OTP expired or invalid");
  }

  const isValid = await compareHash(otp, session.otpHash);
  if (!isValid) {
    throw new Error("Invalid OTP");
  }

  session.used = true;
  await session.save();

  return session;
}
