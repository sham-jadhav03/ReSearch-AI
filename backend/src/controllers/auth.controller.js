import userMOdel from "../models/user.model.js";
import { sendEmail } from "../services/mail.service.js";

export const register = async (req, res) => {
  const { username, email, password } = req.body;

  const isUserAlreadyExist = await userMOdel.findOne({
    $or: [{ username }, { email }],
  });

  if (isUserAlreadyExist) {
    return res.status(400).json({
      message: "User with this email or username already exists.",
      success: false,
      err: "User already exists",
    });
  }

  const user = await userMOdel.create({
    username,
    email,
    password,
  });

  await sendEmail({
    to: email,
    subject: "Welcome to ResearchAI",
    html: `<h1>Welcome to ResearchAI, ${username}!</h1>
            <p>Thank you for registering at <strong>ResearchAI</strong>. We're excited to have you on board!</p>
            <p>Best regards,<br/>The ResearchAI Team</p> 
            `        
  });

  res.status(201).json({
    message: "User registered successfully.",
    success: true,
    user: {
        id: user._id,
        username: user.username,
        email: user.email
    }
  });
};
