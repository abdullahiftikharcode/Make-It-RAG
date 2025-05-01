const express = require('express');
const UserService = require('../services/user.service');
const { verifyToken } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');
const { catchAsync } = require('../middleware/error');

const router = express.Router();

/**
 * @route GET /api/profile
 * @desc Get user profile
 * @access Private
 */
router.get('/', verifyToken, catchAsync(async (req, res) => {
  const profile = await UserService.getProfile(req.user.userId);
  res.json(profile);
}));

/**
 * @route PUT /api/profile
 * @desc Update user profile
 * @access Private
 */
router.put('/', verifyToken, validateRequest({
  firstName: { required: true, minLength: 2, maxLength: 50 },
  lastName: { required: true, minLength: 2, maxLength: 50 },
  email: { 
    required: true, 
    pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 
    message: 'Please enter a valid email address'
  }
}), catchAsync(async (req, res) => {
  const result = await UserService.updateProfile(req.user.userId, req.body);
  res.json(result);
}));

module.exports = router; 