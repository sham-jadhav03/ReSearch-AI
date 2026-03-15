import express from 'express'
import { register } from '../controllers/auth.controller.js';
import { registerValidator } from '../validators/auth.validator.js';

const router = express.Router();

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 * @body { username, email, password }
 */
router.post("/register", registerValidator, register)

export default router