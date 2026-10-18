import { body, validationResult } from "express-validator";

export const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array({ onlyFirstError: true }).map(({ msg, path, location }) => ({
        type: "field",
        msg,
        path,
        location,
      })),
      success: false,
    });
  }

  next();
};

export const registerValidator = [
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Username is required")
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be between 3 and 30 characters")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username can contain letters, numbers, and underscores"),

  body("email")
    .trim()
    .toLowerCase()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address"),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .bail()
    .isLength({ min: 6, max: 72 })
    .withMessage("Password must be between 6 and 72 characters long")
    .bail()
    .custom((password) => Buffer.byteLength(password, "utf8") <= 72)
    .withMessage("Password must not exceed 72 bytes"),

  validate,
];

export const loginValidator = [
  body("email")
    .trim()
    .toLowerCase()
    .notEmpty()
    .withMessage("Email is required.")
    .isEmail()
    .withMessage("Please provide a valid email"),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .bail()
    .isLength({ min: 6, max: 72 })
    .withMessage("Password must be between 6 and 72 characters long")
    .bail()
    .custom((password) => Buffer.byteLength(password, "utf8") <= 72)
    .withMessage("Password must not exceed 72 bytes"),
  validate,
];