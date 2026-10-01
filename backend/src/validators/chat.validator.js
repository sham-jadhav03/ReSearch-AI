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
    .trim()
    .notEmpty()
    .withMessage("Message content is required.")
    .isLength({ max: 4000 })
    .withMessage("Message must be under 4000 characters."),

  // { nullable: true } is required here because the frontend sends
  // `chat: null` explicitly for a brand-new chat (not `undefined`) —
  // express-validator's .optional() only skips undefined by default,
  // so without this, isValidObjectId(null) runs and fails validation.
  body("chat")
    .optional({ nullable: true })
    .custom(isValidObjectId)
    .withMessage("Invalid chat id."),

  validate,
];

export const chatIdParamValidator = [
  param("chatId").custom(isValidObjectId).withMessage("Invalid chat id."),
  validate,
];
