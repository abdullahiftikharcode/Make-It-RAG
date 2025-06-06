const express = require('express');
const ConnectionService = require('../services/connection.service');
const { verifyToken } = require('../middleware/auth');
const { catchAsync } = require('../middleware/error');

const router = express.Router();

/**
 * @route GET /api/schema/:connectionId
 * @desc Get database schema for a connection
 * @access Private
 */
router.get('/:connectionId', verifyToken, catchAsync(async (req, res) => {
  const schema = await ConnectionService.getConnectionSchema(req.params.connectionId, req.user.userId);
  res.json(schema);
}));

module.exports = router; 