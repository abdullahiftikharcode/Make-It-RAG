const express = require('express');
const ConnectionService = require('../services/connection.service');
const { verifyToken } = require('../middleware/auth');
const { catchAsync } = require('../middleware/error');
const { AppError } = require('../middleware/error');

const router = express.Router();

/**
 * @route GET /api/schema/:connectionId
 * @desc Get database schema for a connection
 * @access Private
 */
router.get('/:connectionId', verifyToken, catchAsync(async (req, res) => {
  try {
    const schema = await ConnectionService.getConnectionSchema(req.params.connectionId, req.user.userId);
    if (!schema) {
      throw new AppError('Schema not found', 404);
    }
    res.json({ schema: schema });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}));

module.exports = router; 