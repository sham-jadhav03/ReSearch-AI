import userModel from "../models/user.model.js";
import { sendEmail } from "../services/mail.service.js";
import jwt from "jsonwebtoken";
import { config } from "../config/config.js";
import { createUser, findUserByEmail, findUserWithoutPassword, findUserByUsernameOrEmail, verifyUser } from "../dao/user.dao.js";

/**
 * @desc Register a new user
 * @route POST /api/auth/register
 * @access Public
 * @body { username, email, password }
 */
export const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    const isUserAlreadyExist = await findUserByUsernameOrEmail(username, email)

    if (isUserAlreadyExist) {
      return res.status(400).json({
        message: "User with this email or username already exists.",
        success: false,
        err: "User already exists",
      });
    }

    const user = await createUser({
      username,
      email,
      password
    })

    const emailVerificationToken = jwt.sign(
      {
        email: user.email,
      },
      config.JWT_SECRET,
    );

    const verificationUrl = `${config.SERVER_URL}/api/auth/verify-email?token=${emailVerificationToken}`;

    try {
      await sendEmail({
        to: email,
        subject: "Welcome to ResearchAI",
        html: `<h1>Welcome to ResearchAI, ${username}!</h1>
                <p>Thank you for registering at <strong>ResearchAI</strong>. We're excited to have you on board!</p>
                <p>Please verify your email address by clicking the link below:</p>
                <a href="${verificationUrl}">Verify Email</a>
                <p>If you did not create an account, please ignore this email.</p>
                <p>Best regards,<br/>The ResearchAI Team.</p> 
                `,
      });
    } catch (emailErr) {
      console.error("Verification email sending failed:", emailErr);
    }

    res.status(201).json({
      message: "User registered successfully.",
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc Login user and return JWT token
 * @route POST /api/auth/login
 * @access Public
 * @body { email, password }
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await findUserByEmail(email)

    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password",
        success: false,
        err: "User not found",
      });
    }

    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      return res.status(400).json({
        message: "Invalid email or password",
        success: false,
        err: "Incorrect password",
      });
    }

    if (!user.verified) {
      return res.status(400).json({
        message: "Please verify your email before logging in",
        success: false,
        err: "Email not verified",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
      },
      config.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      message: "Login successful",
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc Get current logged in user's details
 * @route GET /api/auth/get-me
 * @access Private
 * */
export const getMe = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const user = await findUserWithoutPassword(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
        success: false,
        err: "User not found in database",
      });
    }

    res.status(200).json({
      message: "User details fetched successfully",
      success: true,
      user,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc Verify user's email address
 * @route GET /api/auth/verify-email
 * @access Public
 * @query { token }
 */
export const verifyEmail = async (req, res, next) => {
  const { token } = req.query;
  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);

    const user = await verifyUser(decoded.email);

    if (!user) {
      return res.status(400).json({
        message: "User not found.",
        success: false,
        err: "User not found",
      });
    }

    const frontendLoginLink = `${config.CLIENT_URL}/login`;

    const html = `<h1>Email Verified Successfully!</h1>
        <p>Your email has been verified. You can now log in to your account.</p>
        <a href="${frontendLoginLink}">Go to Login</a>
        `;

    return res.send(html);
  } catch (err) {
    return res.status(400).json({
      message: "Invalid or expired token.",
      success: false,
      err: err.message,
    });
  }
};

/**
 * @desc logout user
 * @route POST /api/auth/logout
 * @access Private
 */
export const logout = async (req, res, next) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });
    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (err) {
    next(err);
  }
};