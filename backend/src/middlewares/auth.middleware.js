import jwt from "jsonwebtoken";
import { config } from "../config/config.js";
import userModel from "../models/user.model.js";

export const authUser = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({
      message: "Unauthorized",
      success: false,
      err: "No token provided",
    });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, config.JWT_SECRET);
  } catch (err) {
    return res.status(401).json({
      message: "Unauthorized",
      success: false,
      err: "Invalid token",
    });
  }

  try {
    const user = await userModel.findById(decoded.id).select("_id");

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized",
        success: false,
        err: "User no longer exists",
      });
    }

    req.user = { ...decoded, _id: user._id };
    next();
  } catch (err) {
    return res.status(500).json({
      message: "Internal server error.",
      success: false,
    });
  }
};
