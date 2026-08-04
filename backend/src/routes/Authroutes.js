const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validateRequest = require('../middleware/validateRequest');
const { protect } = require('../middleware/authMiddleware');
const {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
} = require('../controllers/authController');

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

module.exports = router;