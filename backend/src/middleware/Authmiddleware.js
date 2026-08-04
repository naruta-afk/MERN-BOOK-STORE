const jwt = require('jsonwebtoken');
const asyncHandler = require('./asyncHandler');
const User = require('../models/User');

// Verifies JWT and attaches user to req.user
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Prefer httpOnly cookie; fall back to Authorization header
  if (req.cookies?.jwt) {
    token = req.cookies.jwt;
  } else if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.userId).select('-password');

    if (!req.user) {
      res.status(401);
      throw new Error('Not authorized, user not found');
    }

    next();
  } catch (error) {
    res.status(401);
    throw new Error('Not authorized, token failed');
  }
});

// Restricts route to admin users only — use AFTER protect
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized as an admin');
  }
};

module.exports = { protect, admin };