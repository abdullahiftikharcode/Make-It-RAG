const ChatModel = require('../models/chat.model');
const ConnectionModel = require('../models/connection.model');
const PythonService = require('./python.service');
const { AppError } = require('../middleware/error');

/**
 * Chat service for chat functionality
 */
class ChatService {
  /**
   * Process a chat query and generate a response
   * @param {string} connectionId - Connection ID
   * @param {string} query - Natural language query
   * @param {string} sessionId - Session ID (optional)
   * @param {object} settings - Query settings
   * @param {string} userId - User ID
   * @returns {Promise<object>} Response with SQL, explanation, and session info
   */
  static async processQuery(connectionId, query, sessionId, settings, userId) {
    try {
      if (!connectionId || !query) {
        throw new AppError('Missing required fields', 400);
      }
      
      // Get connection details from database
      const connection = await ConnectionModel.findById(connectionId, userId);
      
      if (!connection) {
        throw new AppError('Connection not found', 404);
      }
      
      if (!connection.is_active) {
        throw new AppError('Connection is inactive', 400,
          'This connection is currently inactive. Please reconnect it before using.');
      }
      
      // Generate SQL using the Python service
      const pythonData = await PythonService.generateSQL(
        query,
        connection.connection_string,
        connection.type,
        {
          ...settings,
          subscription_tier: settings?.subscription_tier || "personal"
        }
      );
      
      let currentSessionId = sessionId;
      
      // If no session ID provided, create a new chat session
      if (!currentSessionId) {
        const sessionResult = await ChatModel.createSession({
          connectionId: connection.id,
          title: query.substring(0, 100) // Use first 100 chars of query as title
        }, userId);
        currentSessionId = sessionResult.sessionId;
      }
      
      // Add the user's message
      await ChatModel.addRawMessage(
        currentSessionId,
        'user',
        query,
        null
      );
      
      // Add the assistant's response
      await ChatModel.addRawMessage(
        currentSessionId,
        'assistant',
        pythonData.explanation,
        pythonData.sql
      );
      
      return {
        ...pythonData,
        sessionId: currentSessionId
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Error processing query: ${error.message}`, 500);
    }
  }

  /**
   * Get all chat sessions for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Array of chat sessions
   */
  static async getAllSessions(userId) {
    try {
      return await ChatModel.findAllByUser(userId);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Error fetching chat sessions: ${error.message}`, 500);
    }
  }

  /**
   * Get a specific chat session
   * @param {string} sessionId - Session ID
   * @param {string} userId - User ID
   * @returns {Promise<object>} Chat session with messages
   */
  static async getSession(sessionId, userId) {
    try {
      const session = await ChatModel.findSessionById(sessionId, userId);
      
      if (!session) {
        throw new AppError('Chat session not found', 404);
      }
      
      return session;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Error fetching chat session: ${error.message}`, 500);
    }
  }

  /**
   * Create a new chat session
   * @param {object} sessionData - Session data
   * @param {string} userId - User ID
   * @returns {Promise<object>} Created session info
   */
  static async createSession(sessionData, userId) {
    try {
      const { connectionId, title, messages } = sessionData;
      
      if (!connectionId || !title) {
        throw new AppError('Missing required fields', 400);
      }
      
      // Verify that the connection exists and belongs to the user
      const connection = await ConnectionModel.findById(connectionId, userId);
      
      if (!connection) {
        throw new AppError('Connection not found', 404);
      }
      
      return await ChatModel.createSession({ connectionId, title, messages }, userId);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Error creating chat session: ${error.message}`, 500);
    }
  }

  /**
   * Delete a chat session
   * @param {string} sessionId - Session ID
   * @param {string} userId - User ID
   * @returns {Promise<object>} Success message
   */
  static async deleteSession(sessionId, userId) {
    try {
      const deleted = await ChatModel.deleteSession(sessionId, userId);
      
      if (!deleted) {
        throw new AppError('Chat session not found', 404);
      }
      
      return {
        message: 'Chat session deleted successfully'
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Error deleting chat session: ${error.message}`, 500);
    }
  }

  /**
   * Get chat sessions for a specific connection
   * @param {string} connectionId - Connection ID
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Array of chat sessions
   */
  static async getSessionsByConnection(connectionId, userId) {
    try {
      // First verify that the connection exists or create it
      const connection = await ConnectionModel.findById(connectionId, userId);
      
      if (!connection) {
        // Try to create a new connection with a dummy string first
        const dummyString = `mysql+pymysql://user:pass@host:3306/db`;
        const newConnection = await ConnectionModel.findOrCreate(dummyString, userId);
        connectionId = newConnection.id;
      }
      
      return await ChatModel.findByConnection(connectionId, userId);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Error fetching chat sessions: ${error.message}`, 500);
    }
  }

  /**
   * Get recent chat sessions for a user
   * @param {string} userId - User ID
   * @param {number} limit - Maximum number of sessions to return
   * @returns {Promise<Array>} Array of chat sessions
   */
  static async getRecentSessions(userId, limit = 5) {
    try {
      return await ChatModel.findRecentByUser(userId, limit);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Error fetching recent chats: ${error.message}`, 500);
    }
  }

  /**
   * Create a new chat session with messages
   * @param {string} connectionId - Connection ID
   * @param {string} title - Session title
   * @param {Array} messages - Array of message objects
   * @param {string} userId - User ID
   * @returns {Promise<object>} Created session info
   */
  static async createSessionWithMessages(connectionId, title, messages, userId) {
    try {
      if (!connectionId || !title || !messages || !Array.isArray(messages)) {
        throw new AppError('Missing required fields', 400);
      }
      
      // Verify that the connection exists and belongs to the user
      const connection = await ConnectionModel.findById(connectionId, userId);
      
      if (!connection) {
        throw new AppError('Connection not found', 404);
      }
      
      // Create the session
      const session = await ChatModel.createSession({ connectionId, title, messages: [] }, userId);
      
      // Add all messages
      for (const message of messages) {
        await ChatModel.addRawMessage(
          session.sessionId,
          message.role,
          message.content,
          message.sql || null
        );
      }
      
      return session;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Error creating chat session with messages: ${error.message}`, 500);
    }
  }

  /**
   * Get all chat sessions for a user with formatting for /api/chats endpoint
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Array of chat sessions
   */
  static async getAllChats(userId) {
    try {
      return await ChatModel.findAllChats(userId);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Error fetching chat sessions: ${error.message}`, 500);
    }
  }
}

module.exports = ChatService; 