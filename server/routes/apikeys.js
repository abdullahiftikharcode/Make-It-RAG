const express = require('express');
const ApiKeyService = require('../services/apikey.service');
const { verifyToken } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');
const { catchAsync } = require('../middleware/error');

const router = express.Router();

/**
 * @route GET /api/api-keys
 * @desc Get all API keys for the authenticated user
 * @access Private
 */
router.get('/', verifyToken, catchAsync(async (req, res) => {
  const apiKeys = await ApiKeyService.getApiKeys(req.user.userId);
  res.json(apiKeys);
}));

/**
 * @route GET /api/api-keys/:id
 * @desc Get a specific API key by ID
 * @access Private
 */
router.get('/:id', verifyToken, catchAsync(async (req, res) => {
  const apiKey = await ApiKeyService.getApiKey(req.params.id, req.user.userId);
  res.json(apiKey);
}));

/**
 * @route POST /api/api-keys
 * @desc Generate a new API key
 * @access Private
 */
router.post('/', verifyToken, validateRequest({
  name: { required: true }
}), catchAsync(async (req, res) => {
  const apiKey = await ApiKeyService.generateApiKey(req.user.userId, req.body.name);
  res.status(201).json(apiKey);
}));

/**
 * @route DELETE /api/api-keys/:id
 * @desc Revoke an API key
 * @access Private
 */
router.delete('/:id', verifyToken, catchAsync(async (req, res) => {
  const result = await ApiKeyService.revokeApiKey(req.params.id, req.user.userId);
  res.json(result);
}));

/**
 * @route GET /api/api-keys/:id/usage
 * @desc Get usage statistics for an API key
 * @access Private
 */
router.get('/:id/usage', verifyToken, catchAsync(async (req, res) => {
  const period = req.query.period || 'month';
  const stats = await ApiKeyService.getApiKeyUsageStats(req.params.id, req.user.userId, period);
  res.json(stats);
}));

module.exports = router; 