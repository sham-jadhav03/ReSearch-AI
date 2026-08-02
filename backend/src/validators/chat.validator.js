import { body, param, validationResult } from "express-validator";
import mongoose from "mongoose";

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array(), success: false });
  }
  next();
};

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

export const sendMessageValidator = [
  body("message")
    .if(body("resumeFromIndex").not().exists())
    .trim()
    .notEmpty()
    .withMessage("Message content is required.")
    .isLength({ max: 4000 })
    .withMessage("Message must be under 4000 characters."),

  body("chat")
    .optional()
    .custom(isValidObjectId)
    .withMessage("Invalid chat id."),

  body("resumeFromIndex")
    .optional()
    .isInt({ min: 0 })
    .withMessage("resumeFromIndex must be a non-negative integer."),

  validate,
];

export const chatIdParamValidator = [
  param("chatId").custom(isValidObjectId).withMessage("Invalid chat id."),
  validate,
];