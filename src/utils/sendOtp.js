
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



// import { Resend } from "resend";

// const resend = new Resend(process.env.RESEND_KEY);

// export async function sendOTPEmail(email, otp) {
//   try {
//    const data = await resend.emails.send({
//       from: "Chatrix <onboarding@resend.dev>",
//       to: email,
//       subject: "Your Chatrix OTP",
//       html: `
//         <div style="font-family: Arial, sans-serif">
//           <h2>Verify your email</h2>
//           <p>Your OTP is:</p>
//           <h1 style="letter-spacing: 4px">${otp}</h1>
//           <p>This OTP will expire in 5 minutes.</p>
//           <p>If you did not request this, please ignore.</p>
//         </div>
//       `,
//     });
//     console.log("✅ Email sent successfully:", data);
//   } catch (error) {
//     console.error("❌ Failed to send OTP email", error);
//     throw new Error("Failed to send OTP email");
//   }
// }