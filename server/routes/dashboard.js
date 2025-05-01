const express = require('express');
const DashboardService = require('../services/dashboard.service');
const { verifyToken } = require('../middleware/auth');
const { catchAsync } = require('../middleware/error');

const router = express.Router();

/**
 * @route GET /api/dashboard/stats
 * @desc Get dashboard statistics
 * @access Private
 */
router.get('/stats', verifyToken, catchAsync(async (req, res) => {
  const stats = await DashboardService.getStats(req.user.userId);
  res.json(stats);
}));

/**
 * @route GET /api/dashboard/recent-activity
 * @desc Get recent connections and chats
 * @access Private
 */
router.get('/recent-activity', verifyToken, catchAsync(async (req, res) => {
  const activity = await DashboardService.getRecentActivity(req.user.userId);
  res.json(activity);
}));

/**
 * @route GET /api/dashboard/recent-connections
 * @desc Get recent database connections
 * @access Private
 */
router.get('/recent-connections', verifyToken, catchAsync(async (req, res) => {
  const { connections } = await DashboardService.getRecentConnections(req.user.userId);
  res.json({ connections });
}));

/**
 * @route GET /api/dashboard/recent-chats
 * @desc Get recent chat sessions
 * @access Private
 */
router.get('/recent-chats', verifyToken, catchAsync(async (req, res) => {
  const { sessions } = await DashboardService.getRecentChats(req.user.userId);
  res.json({ sessions });
}));

module.exports = router; 