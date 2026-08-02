import { config } from "../config/config.js";
import nodemailer from "nodemailer";

const fallbackTransport = nodemailer.createTransport({
  streamTransport: true,
  newline: "unix",
  buffer: true,
});

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: config.GOOGLE_USER,
    clientSecret: config.GOOGLE_CLIENT_SECRET,
    refreshToken: config.GOOGLE_REFRESH_TOKEN,
    clientId: config.GOOGLE_CLIENT_ID,
  },
});

transporter
  .verify()
  .then(() => {
    console.log("Email transporter is ready to send emails.");
  })
  .catch((err) => {
    console.warn("Email transporter verification failed. Falling back to local mail transport.", err.message);
  });

export const sendEmail = async ({ to, subject, html, text }) => {
  const mailOptions = {
    from: config.GOOGLE_USER || "research-ai@example.com",
    to,
    subject,
    html,
    text,
  };

  try {
    const details = await transporter.sendMail(mailOptions);
    console.log("Email sent:", details.messageId || details.response);
    return details;
  } catch (error) {
    console.warn("Email send failed. Using local fallback transport.", error.message);
    const fallbackDetails = await fallbackTransport.sendMail(mailOptions);
    console.log("Fallback email transport used:", fallbackDetails.messageId || fallbackDetails.response);
    return fallbackDetails;
  }
};
