const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/auth');
const isAuth = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/signup
router.post(
  '/signup', 
  [
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email')
      .normalizeEmail(),
    body('password')
      .trim()
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
    body('username')
      .trim()
      .optional()
  ],
  authController.signup
);

// POST /api/auth/login
router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email')
      .normalizeEmail(),
    body('password')
      .trim()
      .notEmpty()
      .withMessage('Password is required')
  ],
  authController.login
);

// GET /api/auth/profile
router.get('/profile', isAuth, authController.getProfile);

module.exports = router;