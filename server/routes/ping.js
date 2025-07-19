const express = require('express');
const router = express.Router();

/**
 * @route GET /ping
 * @desc Simple ping endpoint for keep-alive monitoring
 * @access Public
 */
router.get('/', (req, res) => {
  const timestamp = new Date().toISOString();
  res.json({
    status: 'pong',
    service: 'nodejs-api-server',
    timestamp: timestamp,
    message: 'Node.js API server is alive and responding',
    uptime: process.uptime()
  });
});

module.exports = router; 