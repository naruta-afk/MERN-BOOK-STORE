import express from 'express';
import { body } from 'express-validator';
import validateRequest from '../middleware/Validaterequest.js';
import { protect } from '../middleware/Authmiddleware.js';
import {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
} from '../Controllers/Authcontroller.js';

const router = express.Router();

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  validateRequest,
  registerUser
);

router.post(
  '/login',
  [body('email').isEmail(), body('password').notEmpty()],
  validateRequest,
  loginUser
);

router.post('/logout', logoutUser);

router.route('/profile').get(protect, getUserProfile).put(protect, updateUserProfile);

export default router;