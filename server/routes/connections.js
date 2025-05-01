const express = require('express');
const ConnectionService = require('../services/connection.service');
const { verifyToken } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');
const { catchAsync } = require('../middleware/error');

const router = express.Router();

/**
 * @route GET /api/connections
 * @desc Get all connections for a user
 * @access Private
 */
router.get('/', verifyToken, catchAsync(async (req, res) => {
  const connections = await ConnectionService.getAllConnections(req.user.userId);
  res.json(connections);
}));

/**
 * @route POST /api/connections
 * @desc Create a new connection
 * @access Private
 */
router.post('/', verifyToken, validateRequest({
  name: { required: true, maxLength: 100 },
  type: { 
    required: true, 
    enum: ['postgresql', 'mysql', 'sqlserver'] 
  },
  connectionString: { required: true }
}), catchAsync(async (req, res) => {
  const result = await ConnectionService.createConnection(req.body, req.user.userId);
  res.json({
    message: 'Database connection created successfully',
    connection: result
  });
}));

/**
 * @route DELETE /api/connections/:connectionId
 * @desc Delete a connection
 * @access Private
 */
router.delete('/:connectionId', verifyToken, catchAsync(async (req, res) => {
  const result = await ConnectionService.deleteConnection(req.params.connectionId, req.user.userId);
  res.json(result);
}));

/**
 * @route POST /api/connections/:connectionId/reconnect
 * @desc Reconnect to a database
 * @access Private
 */
router.post('/:connectionId/reconnect', verifyToken, catchAsync(async (req, res) => {
  const result = await ConnectionService.reconnectConnection(req.params.connectionId, req.user.userId);
  res.json(result);
}));

/**
 * @route GET /api/connections/:connectionId/schema
 * @desc Get database schema for a connection
 * @access Private
 */
router.get('/:connectionId/schema', verifyToken, catchAsync(async (req, res) => {
  const schema = await ConnectionService.getConnectionSchema(req.params.connectionId, req.user.userId);
  res.json(schema);
}));

/**
 * @route GET /schema/:connectionId
 * @desc Get database schema for a connection (direct route for backward compatibility)
 * @access Private
 */
router.get('/schema/:connectionId', verifyToken, catchAsync(async (req, res) => {
  const schema = await ConnectionService.getConnectionSchema(req.params.connectionId, req.user.userId);
  res.json(schema);
}));

module.exports = router; 