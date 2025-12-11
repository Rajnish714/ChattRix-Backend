
import nodemailer from "nodemailer";


export const sendOTPEmail= async (email, otp) => {
 
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,    
      pass: process.env.EMAIL_PASS,    
    },
  });

  await transporter.sendMail({
    from: `"Chat App" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your OTP Code",
    html: `
      <div style="font-family: Arial; padding: 20px;">
        <h2>Your Verification Code</h2>
        <h1 style="letter-spacing: 2px; color: #2563eb;">${otp}</h1>
        <p>This OTP expires in <b>5 minutes</b>.</p>
      </div>
    `,
  });
};



