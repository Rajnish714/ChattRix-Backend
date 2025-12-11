import { Otp } from "../models/otp.model.js"
import bcrypt from "bcrypt";
import { sendOTPEmail } from "../utils/sendOtp.js";
export async function sendOTP(email,type) {
  await Otp.deleteMany({ email });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpHash = await bcrypt.hash(otp, 10);

  const newRecord = await Otp.create({
    email,
    otpHash,
    type, 
    expiresAt: Date.now() + 5 * 60 * 1000,
  });
  await sendOTPEmail(email, otp);
  return {  otpSession: newRecord._id.toString() };
}

export async function verifyOTPService(otp, otpSession) {

  if (!otp || !otpSession) {
    return { success: false, message: "Missing OTP or Session" };
  }

  const record = await Otp.findById(otpSession);
  if (!record) {
    return { success: false, message: "OTP session expired" };
  }

  const email = record.email;
  if (record.expiresAt < Date.now()) {
    await Otp.deleteMany({ email });
    return { success: false, message: "OTP expired" };
  }

  const isMatch = await bcrypt.compare(otp, record.otpHash);
  if (!isMatch) {
    return { success: false, message: "Invalid OTP" };
  }

  await Otp.deleteMany({ email });

  return { success: true, email,type: record.type };
}