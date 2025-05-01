const express = require('express');
const UserService = require('../services/user.service');
const { verifyToken } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');
const { catchAsync } = require('../middleware/error');

const router = express.Router();

/**
 * @route GET /api/settings
 * @desc Get user settings
 * @access Private
 */
router.get('/', verifyToken, catchAsync(async (req, res) => {
  const settings = await UserService.getSettings(req.user.userId);
  res.json(settings);
}));

/**
 * @route PUT /api/settings
 * @desc Update user settings
 * @access Private
 */
router.put('/', verifyToken, validateRequest({
  query_timeout: { 
    validate: (value) => {
      if (value !== undefined && (isNaN(value) || value < 5 || value > 120)) {
        return 'Query timeout must be a number between 5 and 120 seconds';
      }
    }
  },
  theme: {
    enum: ['light', 'dark', 'system'],
  }
}), catchAsync(async (req, res) => {
  const result = await UserService.updateSettings(req.user.userId, req.body);
  res.json(result);
}));

module.exports = router; 