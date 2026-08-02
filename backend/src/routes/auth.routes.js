import express from 'express'
import { getMe, login, register, verifyEmail } from '../controllers/auth.controller.js';
import { loginValidator, registerValidator } from '../validators/auth.validator.js';
import {authUser} from "../middlewares/auth.middleware.js"

const router = express.Router();

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 * @body { username, email, password }
 */
router.post("/register", registerValidator, register)

/**
 * @route POST /api/auth/login
 * @desc Login user and return JWT token
 * @access Public
 * @body { email, password }
 */
router.post("/login", loginValidator, login)

/**
 * @route GET /api/auth/get-me
 * @desc Get current logged in user's details
 * @access Private
 */
router.get("/get-me", authUser, getMe)

/**
 * @route GET /api/auth/verify-email
 * @desc Verify user's email address
 * @access Public
 * @query { token }
 */
router.get("/verify-email", verifyEmail)



export default router