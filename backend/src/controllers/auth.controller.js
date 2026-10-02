import { config } from "../config/config.js";
import userModel from "../models/user.model.js";
import { sendEmail } from "../services/mail.service.js";
import jwt from "jsonwebtoken";

/**
 * @desc Register a new user
 * @route POST /api/auth/register
 * @access Public
 * @body { username, email, password }
 */
export const register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const isUserAlreadyExist = await userModel.findOne({
      $or: [{ username }, { email }],
    });

    if (isUserAlreadyExist) {
      if (
        process.env.NODE_ENV !== "production" &&
        !isUserAlreadyExist.verified
      ) {
        const emailVerificationToken = jwt.sign(
          {
            email: isUserAlreadyExist.email,
            purpose: "email_verification",
          },
          config.EMAIL_SECRET,
          { expiresIn: "1h" },
        );

        return res.status(409).json({
          message: "Account already exists and needs email verification.",
          success: false,
          verified: false,
          verificationUrl: `${config.SERVER_URL}/api/auth/verify-email?token=${emailVerificationToken}`,
        });
      }

      return res.status(400).json({
        message: "Registration failed.",
        success: false,
      });
    }

    const user = await userModel.create({
      username,
      email,
      password,
    });

    const emailVerificationToken = jwt.sign(
      {
        email: user.email,
        purpose: "email_verification",
      },
      config.EMAIL_SECRET,
      { expiresIn: "1h" },
    );

    try {
      await sendEmail({
        to: email,
        subject: "Welcome to ResearchAI",
        html: `<h1>Welcome to ResearchAI, ${username}!</h1>
                <p>Thank you for registering at <strong>ResearchAI</strong>. We're excited to have you on board!</p>
                <p>Please verify your email address by clicking the link below:</p>
                <a href="${config.SERVER_URL}/api/auth/verify-email?token=${emailVerificationToken}">Verify Email</a>
                <p>If you did not create an account, please ignore this email.</p>
                <p>Best regards,<br/>The ResearchAI Team.</p>
                `,
      });
    } catch (error) {
      console.warn("Verification email could not be sent:", error.message);
    }

    const response = {
      message: "User registered successfully. Please check your email to verify your account.",
      success: true,
      verified: false,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    };

    if (process.env.NODE_ENV !== "production") {
      response.verificationUrl = `${config.SERVER_URL}/api/auth/verify-email?token=${emailVerificationToken}`;
    }

    res.status(201).json(response);
  } catch (error) {
    console.error("Registration error:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Registration failed.",
        success: false,
      });
    }
    return res.status(500).json({
      message: "Internal server error.",
      success: false,
    });
  }
};

/**
 * @desc Login user and return JWT token
 * @route POST /api/auth/login
 * @access Public
 * @body { email, password }
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password",
        success: false,
      });
    }

    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      return res.status(400).json({
        message: "Invalid email or password",
        success: false,
      });
    }

    if (!user.verified) {
      return res.status(400).json({
        message: "Please verify your email before logging in",
        success: false,
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

    const isProd = process.env.NODE_ENV === "production";
    res.cookie("token", token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      maxAge: 7 * 24 * 3600 * 1000,
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
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      message: "Internal server error.",
      success: false,
    });
  }
};

/**
 * @desc Get current logged in user's details
 * @route GET /api/auth/get-me
 * @access Private
 * */
export const getMe = async (req, res) => {
  const userId = req.user?.id || req.user?._id;

  const user = await userModel.findById(userId).select("-password");

  if (!user) {
    return res.status(404).json({
      message: "User not found.",
      success: false,
      err: "User not found",
    });
  }

  res.setHeader("Cache-Control", "no-store");
  res.status(200).json({
    message: "User details fetched successfully",
    success: true,
    user,
  });
};

/**
 * @desc Render email verification landing page
 * @route GET /api/auth/verify-email
 * @access Public
 * @query { token }
 */
export const getVerifyEmailPage = async (req, res) => {
  const { token } = req.query;

  let decoded;
  try {
    decoded = jwt.verify(token, config.EMAIL_SECRET);
  } catch (err) {
    return res.status(400).json({
      message: "Invalid or expired token.",
      success: false,
      err: err.message,
    });
  }

  if (
    !decoded.email ||
    typeof decoded.email !== "string" ||
    decoded.purpose !== "email_verification"
  ) {
    return res.status(400).json({
      message: "Invalid token.",
      success: false,
      err: "Token purpose or email claim missing or invalid",
    });
  }

  let user;
  try {
    user = await userModel.findOne({ email: decoded.email });
  } catch (err) {
    return res.status(500).json({
      message: "Internal server error.",
      success: false,
    });
  }

  if (!user) {
    return res.status(400).json({
      message: "User not found.",
      success: false,
      err: "User not found",
    });
  }

  if (user.verified) {
    return res.send(`
      <h1>Email Already Verified</h1>
      <p>Your email is already verified. You can now log in to your account.</p>
      <a href="${config.CLIENT_URL}/login">Go to Login</a>
    `);
  }

  const html = `
    <h1>Confirm Email Verification</h1>
    <p>Click the button below to confirm your email address.</p>
    <form method="POST" action="${config.SERVER_URL}/api/auth/verify-email">
      <input type="hidden" name="token" value="${token}" />
      <button type="submit">Confirm Email</button>
    </form>
  `;

  return res.send(html);
};

/**
 * @desc Verify user's email address
 * @route POST /api/auth/verify-email
 * @access Public
 * @body { token }
 */
export const verifyEmail = async (req, res) => {
  const { token } = req.body;

  let decoded;
  try {
    decoded = jwt.verify(token, config.EMAIL_SECRET);
  } catch (err) {
    return res.status(400).json({
      message: "Invalid or expired token.",
      success: false,
      err: err.message,
    });
  }

  if (
    !decoded.email ||
    typeof decoded.email !== "string" ||
    decoded.purpose !== "email_verification"
  ) {
    return res.status(400).json({
      message: "Invalid token.",
      success: false,
      err: "Token purpose or email claim missing or invalid",
    });
  }

  let result;
  try {
    result = await userModel.updateOne(
      { email: decoded.email },
      { $set: { verified: true } },
    );
  } catch (err) {
    return res.status(500).json({
      message: "Internal server error.",
      success: false,
    });
  }

  if (result.matchedCount === 0) {
    return res.status(400).json({
      message: "User not found.",
      success: false,
      err: "User not found",
    });
  }

  const html = `<h1>Email Verified Successfully!</h1>
      <p>Your email has been verified. You can now log in to your account.</p>
      <a href="${config.CLIENT_URL}/login">Go to Login</a>
      `;

  return res.send(html);
};

/**
 * @desc Logout user and clear cookie
 * @route POST /api/auth/logout
 * @access Public
 */
export const logout = async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });

  res.status(200).json({
    message: "Logged out successfully",
    success: true,
  });
};

/**
 * @desc Resend email verification
 * @route POST /api/auth/resend-verification
 * @access Public
 */
export const resendVerification = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      message: "Email is required.",
      success: false,
    });
  }

  const user = await userModel.findOne({ email });

  if (!user) {
    return res.status(404).json({
      message: "User not found.",
      success: false,
    });
  }

  if (user.verified) {
    return res.status(400).json({
      message: "Email is already verified.",
      success: false,
    });
  }

  try {
    const emailVerificationToken = jwt.sign(
      {
        email: user.email,
        purpose: "email_verification",
      },
      config.EMAIL_SECRET,
      { expiresIn: "1h" },
    );

    await sendEmail({
      to: user.email,
      subject: "Verify your ResearchAI email",
      html: `<h1>Welcome to ResearchAI!</h1>
              <p>Please verify your email address by clicking the link below:</p>
              <a href="${config.SERVER_URL}/api/auth/verify-email?token=${emailVerificationToken}">Verify Email</a>
              <p>If you did not create an account, please ignore this email.</p>
              `,
    });

    res.status(200).json({
      message: "Verification email sent. Please check your inbox.",
      success: true,
    });
  } catch (error) {
    console.error("Resend verification error:", error);
    res.status(500).json({
      message: "Internal server error.",
      success: false,
    });
  }
};
