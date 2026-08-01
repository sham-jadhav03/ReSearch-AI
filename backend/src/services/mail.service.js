import { config } from "../config/config.js";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: config.GOOGLE_USER,
    clientSecret: config.GOOGLE_CLIENT_SECRET,
    refreshToken: config.GOOGLE_REFRESH_TOKEN,
    clientId: config.GOOGLE_CLIENT_SECRET,
  },
});

transporter
  .verify()
  .then(() => {
    console.log("Email transporter is ready to send emails.");
  })
  .catch((err) => {
    console.log("Email transporter verification failed:", err);
  });

export const sendEmail = async ({ to, subject, html, text }) => {
  const mailOptions = {
    from: config.GOOGLE_USER,
    to,
    subject,
    html,
    text,
  };

  const details = await transporter.sendMail(mailOptions);
  console.log("Email sent:", details);
};
