const express = require('express');
const ChatService = require('../services/chat.service');
const UserService = require('../services/user.service');
const { verifyToken } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');
const { catchAsync } = require('../middleware/error');

const router = express.Router();

/**
 * @route POST /api/chat
 * @desc Process a chat query
 * @access Private
 */
router.post('/', verifyToken, validateRequest({
  connectionId: { required: true },
  query: { required: true }
}), catchAsync(async (req, res) => {
  // Get user settings
  const settings = await UserService.getSettings(req.user.userId);
  
  // Process the query
  const result = await ChatService.processQuery(
    req.body.connectionId,
    req.body.query,
    req.body.sessionId,
    settings,
    req.user.userId
  );
  
  res.json(result);
}));

/**
 * @route GET /api/chat/sessions
 * @desc Get all chat sessions for a user
 * @access Private
 */
router.get('/sessions', verifyToken, catchAsync(async (req, res) => {
  const result = await ChatService.getAllSessions(req.user.userId);
  res.json(result);
}));

/**
 * @route GET /api/chat/sessions/:sessionId
 * @desc Get a specific chat session
 * @access Private
 */
router.get('/sessions/:sessionId', verifyToken, catchAsync(async (req, res) => {
  const result = await ChatService.getSession(req.params.sessionId, req.user.userId);
  res.json(result);
}));

/**
 * @route POST /api/chat/sessions
 * @desc Create a new chat session
 * @access Private
 */
router.post('/sessions', verifyToken, validateRequest({
  connectionId: { required: true },
  title: { required: true }
}), catchAsync(async (req, res) => {
  const result = await ChatService.createSession(req.body, req.user.userId);
  res.json(result);
}));

/**
 * @route DELETE /api/chat/sessions/:sessionId
 * @desc Delete a chat session
 * @access Private
 */
router.delete('/sessions/:sessionId', verifyToken, catchAsync(async (req, res) => {
  const result = await ChatService.deleteSession(req.params.sessionId, req.user.userId);
  res.json(result);
}));

/**
 * @route GET /api/chat/sessions/connection/:connectionId
 * @desc Get all chat sessions for a specific connection
 * @access Private
 */
router.get('/sessions/connection/:connectionId', verifyToken, catchAsync(async (req, res) => {
  const result = await ChatService.getSessionsByConnection(req.params.connectionId, req.user.userId);
  res.json(result);
}));

/**
 * @route GET /api/chats
 * @desc Get all chat sessions for a user (duplicate of /sessions for backward compatibility)
 * @access Private
 */
router.get('/chats', verifyToken, catchAsync(async (req, res) => {
  const result = await ChatService.getAllChats(req.user.userId);
  res.json(result);
}));

/**
 * @route DELETE /api/chats/:sessionId
 * @desc Delete a chat session (duplicate of /sessions/:sessionId for backward compatibility)
 * @access Private
 */
router.delete('/chats/:sessionId', verifyToken, catchAsync(async (req, res) => {
  const result = await ChatService.deleteSession(req.params.sessionId, req.user.userId);
  res.json(result);
}));

module.exports = router; 