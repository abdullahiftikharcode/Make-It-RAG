const { promisePool } = require('../config/database');
const { AppError } = require('../middleware/error');
const { v4: uuidv4 } = require('uuid');

class ChatModel {
  /**
   * Find a chat session by ID and user ID
   * @param {string} sessionId - Session ID
   * @param {string} userId - User ID
   * @returns {Promise<object|null>} Session with messages or null if not found
   */
  static async findSessionById(sessionId, userId) {
    try {
      // First, get the session details
      const [sessions] = await promisePool.query(
        `SELECT 
          cs.id AS sessionId,
          cs.title,
          cs.created_at,
          cs.updated_at,
          dc.id AS connectionId,
          dc.name AS connectionName,
          dc.connection_string AS connectionString,
          dc.type AS connectionType
        FROM chat_sessions cs
        JOIN database_connections dc ON cs.connection_id = dc.id
        WHERE cs.id = ? AND cs.user_id = ?`,
        [sessionId, userId]
      );
      
      if (sessions.length === 0) {
        return null;
      }
      
      const session = sessions[0];
      
      // Then, get all messages for this session
      const [messages] = await promisePool.query(
        `SELECT id, role, content, sql_query, created_at
         FROM chat_messages
         WHERE session_id = ?
         ORDER BY created_at ASC, id ASC`,
        [sessionId]
      );
      
      return {
        sessionId: session.sessionId,
        title: session.title,
        connectionId: session.connectionId,
        connectionName: session.connectionName,
        connectionString: session.connectionString,
        connectionType: session.connectionType,
        createdAt: session.created_at,
        updatedAt: session.updated_at,
        messages
      };
    } catch (error) {
      throw new AppError(`Error finding chat session: ${error.message}`, 500);
    }
  }

  /**
   * Find all chat sessions for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Array of chat session objects
   */
  static async findAllByUser(userId) {
    try {
      const [rows] = await promisePool.query(
        `SELECT 
          cs.id,
          cs.title,
          cs.created_at,
          cs.updated_at,
          dc.name as connection_name,
          (
            SELECT content 
            FROM chat_messages 
            WHERE session_id = cs.id AND role = 'user' 
            ORDER BY created_at ASC 
            LIMIT 1
          ) as first_query,
          (
            SELECT COUNT(*) 
            FROM chat_messages 
            WHERE session_id = cs.id
          ) as message_count
        FROM chat_sessions cs
        JOIN database_connections dc ON cs.connection_id = dc.id
        WHERE cs.user_id = ?
        ORDER BY cs.updated_at DESC`,
        [userId]
      );
      
      return { sessions: rows };
    } catch (error) {
      throw new AppError(`Error finding chat sessions: ${error.message}`, 500);
    }
  }

  /**
   * Find chat sessions for a specific connection
   * @param {string} connectionId - Connection ID
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Array of chat session objects
   */
  static async findByConnection(connectionId, userId) {
    try {
      // First verify that the connection belongs to the user
      const [connections] = await promisePool.query(
        `SELECT id FROM database_connections 
         WHERE id = ? AND user_id = ?`,
        [connectionId, userId]
      );
      
      if (connections.length === 0) {
        // Return empty sessions list for new connections
        return { sessions: [] };
      }
      
      // Fetch all chat sessions for this connection
      const [sessions] = await promisePool.query(
        `SELECT 
          cs.id,
          cs.title,
          cs.created_at,
          cs.updated_at,
          dc.name as connection_name,
          (
            SELECT content 
            FROM chat_messages 
            WHERE session_id = cs.id AND role = 'user' 
            ORDER BY created_at ASC 
            LIMIT 1
          ) as first_query,
          (SELECT COUNT(*) FROM chat_messages WHERE session_id = cs.id) as message_count
        FROM chat_sessions cs
        JOIN database_connections dc ON cs.connection_id = dc.id
        WHERE cs.connection_id = ?
        ORDER BY cs.updated_at DESC`,
        [connectionId]
      );
      
      return { sessions };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Error finding chat sessions: ${error.message}`, 500);
    }
  }

  /**
   * Create a new chat session
   * @param {object} sessionData - Session data object
   * @param {string} userId - User ID
   * @returns {Promise<object>} Created session ID
   */
  static async createSession(sessionData, userId) {
    const conn = await promisePool.getConnection();
    try {
      await conn.beginTransaction();
      
      const { connectionId, title, messages } = sessionData;
      
      // Generate a unique ID for the chat session
      const sessionId = uuidv4();
      
      // Insert the chat session
      await conn.query(
        `INSERT INTO chat_sessions 
         (id, user_id, connection_id, title)
         VALUES (?, ?, ?, ?)`,
        [sessionId, userId, connectionId, title]
      );
      
      // Insert all messages if provided
      if (messages && Array.isArray(messages)) {
        const messageQuery = `
          INSERT INTO chat_messages 
          (id, session_id, role, content, sql_query)
          VALUES (?, ?, ?, ?, ?)
        `;
        
        for (const message of messages) {
          const messageId = uuidv4();
          await conn.query(
            messageQuery,
            [
              messageId,
              sessionId,
              message.role,
              message.content,
              message.sql || null
            ]
          );
        }
      }
      
      await conn.commit();
      
      return {
        message: 'Chat session saved successfully',
        sessionId
      };
    } catch (error) {
      await conn.rollback();
      throw new AppError(`Error creating chat session: ${error.message}`, 500);
    } finally {
      conn.release();
    }
  }

  /**
   * Add a new message to a chat session
   * @param {string} sessionId - Session ID
   * @param {object} data - Message data
   * @returns {Promise<object>} Added message ID
   */
  static async addMessage(sessionId, data) {
    try {
      // Generate IDs for user and assistant messages
      const userMessageId = uuidv4();
      const assistantMessageId = uuidv4();
      
      // Insert the user's message first
      await promisePool.query(
        `INSERT INTO chat_messages 
         (id, session_id, role, content, sql_query, created_at)
         VALUES (?, ?, ?, ?, NULL, NOW())`,
        [userMessageId, sessionId, 'user', data.query]
      );
      
      // Then insert the assistant's response
      await promisePool.query(
        `INSERT INTO chat_messages 
         (id, session_id, role, content, sql_query, created_at)
         VALUES (?, ?, ?, ?, ?, NOW() + INTERVAL 1 SECOND)`,
        [
          assistantMessageId,
          sessionId,
          'assistant',
          data.explanation,
          data.sqlQuery
        ]
      );
      
      // Update the session's updated_at timestamp
      await promisePool.query(
        `UPDATE chat_sessions 
         SET updated_at = NOW() 
         WHERE id = ?`,
        [sessionId]
      );
      
      return {
        userMessageId,
        assistantMessageId
      };
    } catch (error) {
      throw new AppError(`Error adding message: ${error.message}`, 500);
    }
  }

  /**
   * Add a raw message to a chat session with specified role and content
   * @param {string} sessionId - Session ID
   * @param {string} role - Message role (user/assistant)
   * @param {string} content - Message content
   * @param {string|null} sqlQuery - Optional SQL query for assistant messages
   * @returns {Promise<object>} Added message ID
   */
  static async addRawMessage(sessionId, role, content, sqlQuery = null) {
    try {
      const messageId = uuidv4();
      
      // Insert the message
      await promisePool.query(
        `INSERT INTO chat_messages 
         (id, session_id, role, content, sql_query, created_at)
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [messageId, sessionId, role, content, sqlQuery]
      );
      
      // Update the session's updated_at timestamp
      await promisePool.query(
        `UPDATE chat_sessions 
         SET updated_at = NOW() 
         WHERE id = ?`,
        [sessionId]
      );
      
      return { messageId };
    } catch (error) {
      throw new AppError(`Error adding raw message: ${error.message}`, 500);
    }
  }

  /**
   * Delete a chat session and its messages
   * @param {string} sessionId - Session ID
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} True if successful
   */
  static async deleteSession(sessionId, userId) {
    const conn = await promisePool.getConnection();
    try {
      await conn.beginTransaction();
      
      // First, verify that the session belongs to the user
      const [sessions] = await conn.query(
        'SELECT id FROM chat_sessions WHERE id = ? AND user_id = ?',
        [sessionId, userId]
      );
      
      if (sessions.length === 0) {
        throw new AppError('Chat session not found', 404);
      }
      
      // Delete all messages for the session
      await conn.query(
        'DELETE FROM chat_messages WHERE session_id = ?',
        [sessionId]
      );
      
      // Delete the session record
      await conn.query(
        'DELETE FROM chat_sessions WHERE id = ?',
        [sessionId]
      );
      
      await conn.commit();
      
      return true;
    } catch (error) {
      await conn.rollback();
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Error deleting chat session: ${error.message}`, 500);
    } finally {
      conn.release();
    }
  }

  /**
   * Get recent chat sessions for a user
   * @param {string} userId - User ID
   * @param {number} limit - Maximum number of sessions to return
   * @returns {Promise<Array>} Array of chat session objects
   */
  static async findRecentByUser(userId, limit = 5) {
    try {
      const [rows] = await promisePool.query(
        `SELECT 
          cs.id,
          cs.title,
          dc.name AS connection_name,
          cs.created_at,
          cs.updated_at,
          (
            SELECT content 
            FROM chat_messages 
            WHERE session_id = cs.id AND role = 'user'
            ORDER BY created_at ASC 
            LIMIT 1
          ) AS first_query,
          (
            SELECT COUNT(*) 
            FROM chat_messages 
            WHERE session_id = cs.id
          ) AS message_count
        FROM chat_sessions cs
        JOIN database_connections dc ON cs.connection_id = dc.id
        WHERE cs.user_id = ?
        ORDER BY cs.updated_at DESC
        LIMIT ?`,
        [userId, limit]
      );
      
      return { sessions: rows };
    } catch (error) {
      throw new AppError(`Error finding recent chats: ${error.message}`, 500);
    }
  }

  /**
   * Find all chat sessions for a user, with formatting specific to the /api/chats endpoint
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Array of chat session objects formatted for /api/chats
   */
  static async findAllChats(userId) {
    try {
      const [rows] = await promisePool.query(
        `SELECT 
          cs.id AS sessionId,
          dc.name AS connectionName,
          cs.created_at,
          cs.updated_at,
          (
            SELECT content 
            FROM chat_messages 
            WHERE session_id = cs.id AND role = 'user' 
            ORDER BY created_at ASC 
            LIMIT 1
          ) AS firstQuery,
          (
            SELECT COUNT(*) 
            FROM chat_messages 
            WHERE session_id = cs.id
          ) AS messageCount
        FROM chat_sessions cs
        JOIN database_connections dc ON cs.connection_id = dc.id
        WHERE cs.user_id = ?
        ORDER BY cs.updated_at DESC`,
        [userId]
      );
      
      return { sessions: rows };
    } catch (error) {
      throw new AppError(`Error finding chat sessions: ${error.message}`, 500);
    }
  }
}

module.exports = ChatModel; 