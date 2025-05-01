const express = require('express');
const AuthService = require('../services/auth.service');
const { verifyToken } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');
const { catchAsync } = require('../middleware/error');

const router = express.Router();

/**
 * @route POST /signup
 * @desc Register a new user
 * @access Public
 */
router.post('/signup', validateRequest({
  name: { required: true, minLength: 2, maxLength: 100 },
  email: { 
    required: true, 
    pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 
    message: 'Please enter a valid email address'
  },
  password: { required: true, minLength: 6 }
}), catchAsync(async (req, res) => {
  const result = await AuthService.register(req.body);
  res.json(result);
}));

/**
 * @route POST /login
 * @desc Login user
 * @access Public
 */
router.post('/login', validateRequest({
  email: { required: true },
  password: { required: true }
}), catchAsync(async (req, res) => {
  const result = await AuthService.login(req.body);
  res.json(result);
}));

/**
 * @route GET /validate-token
 * @desc Validate JWT token
 * @access Private
 */
router.get('/validate-token', verifyToken, catchAsync(async (req, res) => {
  res.json({
    message: 'Token is valid',
    user: {
      userId: req.user.userId,
      role: req.user.role
    }
  });
}));

/**
 * @route PUT /change-password
 * @desc Change user password
 * @access Private
 */
router.put('/change-password', verifyToken, validateRequest({
  currentPassword: { required: true },
  newPassword: { required: true, minLength: 6 },
  confirmNewPassword: { 
    required: true,
    validate: (value, body) => {
      if (value !== body.newPassword) {
        return 'New passwords do not match';
      }
    }
  }
}), catchAsync(async (req, res) => {
  const result = await AuthService.changePassword(req.user.userId, req.body);
  res.json(result);
}));

module.exports = router; 