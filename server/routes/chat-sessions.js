const express = require('express');
const ChatService = require('../services/chat.service');
const { verifyToken } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');
const { catchAsync } = require('../middleware/error');

const router = express.Router();

/**
 * @route GET /api/chat-sessions
 * @desc Get all chat sessions for a user
 * @access Private
 */
router.get('/', verifyToken, catchAsync(async (req, res) => {
  const result = await ChatService.getAllSessions(req.user.userId);
  res.json(result);
}));

/**
 * @route POST /api/chat-sessions
 * @desc Create a new chat session
 * @access Private
 */
router.post('/', verifyToken, validateRequest({
  connectionId: { required: true },
  title: { required: true },
  messages: { required: true }
}), catchAsync(async (req, res) => {
  const result = await ChatService.createSessionWithMessages(
    req.body.connectionId,
    req.body.title,
    req.body.messages,
    req.user.userId
  );
  res.json({
    message: 'Chat session saved successfully',
    sessionId: result.sessionId
  });
}));

/**
 * @route GET /api/chat-sessions/connection/:connectionId
 * @desc Get all chat sessions for a specific connection
 * @access Private
 * Note: This specific route must be defined BEFORE the :sessionId route
 */
router.get('/connection/:connectionId', verifyToken, catchAsync(async (req, res) => {
  const result = await ChatService.getSessionsByConnection(req.params.connectionId, req.user.userId);
  res.json(result);
}));

/**
 * @route GET /api/chat-sessions/:sessionId
 * @desc Get a specific chat session
 * @access Private
 */
router.get('/:sessionId', verifyToken, catchAsync(async (req, res) => {
  const result = await ChatService.getSession(req.params.sessionId, req.user.userId);
  res.json(result);
}));

/**
 * @route DELETE /api/chat-sessions/:sessionId
 * @desc Delete a chat session
 * @access Private
 */
router.delete('/:sessionId', verifyToken, catchAsync(async (req, res) => {
  const result = await ChatService.deleteSession(req.params.sessionId, req.user.userId);
  res.json(result);
}));

module.exports = router; 