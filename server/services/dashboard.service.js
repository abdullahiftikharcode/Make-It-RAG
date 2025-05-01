const { promisePool } = require('../config/database');
const ConnectionService = require('./connection.service');
const ChatService = require('./chat.service');
const { AppError } = require('../middleware/error');

/**
 * Dashboard service for dashboard statistics
 */
class DashboardService {
  /**
   * Get dashboard statistics for a user
   * @param {string} userId - User ID
   * @returns {Promise<object>} Dashboard statistics
   */
  static async getStats(userId) {
    try {
      // Query for total queries (assumed to be chat messages from the user)
      const totalQueriesQuery = `
        SELECT COUNT(*) AS totalQueries
        FROM chat_messages cm
        JOIN chat_sessions cs ON cm.session_id = cs.id
        WHERE cs.user_id = ? AND cm.role = 'user'
      `;

      // Query for active connections for the user
      const activeConnectionsQuery = `
        SELECT COUNT(*) AS activeConnections
        FROM database_connections
        WHERE user_id = ? AND is_active = true
      `;

      // Query for saved chats (i.e. chat sessions)
      const savedChatsQuery = `
        SELECT COUNT(*) AS savedChats
        FROM chat_sessions
        WHERE user_id = ?
      `;

      // Queries for this week data using YEARWEEK with mode 1 (week starts on Monday)
      const queriesThisWeekQuery = `
        SELECT COUNT(*) AS queriesThisWeek
        FROM chat_messages cm
        JOIN chat_sessions cs ON cm.session_id = cs.id
        WHERE cs.user_id = ? 
          AND cm.role = 'user' 
          AND YEARWEEK(cm.created_at, 1) = YEARWEEK(CURDATE(), 1)
      `;

      const activeConnectionsThisWeekQuery = `
        SELECT COUNT(*) AS activeConnectionsThisWeek
        FROM database_connections
        WHERE user_id = ? 
          AND is_active = true 
          AND YEARWEEK(created_at, 1) = YEARWEEK(CURDATE(), 1)
      `;

      const savedChatsThisWeekQuery = `
        SELECT COUNT(*) AS savedChatsThisWeek
        FROM chat_sessions
        WHERE user_id = ? 
          AND YEARWEEK(created_at, 1) = YEARWEEK(CURDATE(), 1)
      `;

      // Execute all queries in parallel
      const [
        totalQueriesResult,
        activeConnectionsResult,
        savedChatsResult,
        queriesThisWeekResult,
        activeConnectionsThisWeekResult,
        savedChatsThisWeekResult
      ] = await Promise.all([
        promisePool.query(totalQueriesQuery, [userId]),
        promisePool.query(activeConnectionsQuery, [userId]),
        promisePool.query(savedChatsQuery, [userId]),
        promisePool.query(queriesThisWeekQuery, [userId]),
        promisePool.query(activeConnectionsThisWeekQuery, [userId]),
        promisePool.query(savedChatsThisWeekQuery, [userId]),
      ]);

      // Extract the values from the results
      const totalQueries = totalQueriesResult[0][0].totalQueries;
      const activeConnections = activeConnectionsResult[0][0].activeConnections;
      const savedChats = savedChatsResult[0][0].savedChats;
      const queriesThisWeek = queriesThisWeekResult[0][0].queriesThisWeek;
      const activeConnectionsThisWeek = activeConnectionsThisWeekResult[0][0].activeConnectionsThisWeek;
      const savedChatsThisWeek = savedChatsThisWeekResult[0][0].savedChatsThisWeek;
      
      return {
        totalQueries,
        activeConnections,
        savedChats,
        queriesThisWeek,
        activeConnectionsThisWeek,
        savedChatsThisWeek,
      };
    } catch (error) {
      throw new AppError(`Error fetching dashboard stats: ${error.message}`, 500);
    }
  }

  /**
   * Get recent activity for a user
   * @param {string} userId - User ID
   * @returns {Promise<object>} Recent connections and chats
   */
  static async getRecentActivity(userId) {
    try {
      // Get recent connections and chats in parallel
      const [recentConnections, recentChats] = await Promise.all([
        this.getRecentConnections(userId),
        this.getRecentChats(userId)
      ]);
      
      return {
        recentConnections: recentConnections.connections,
        recentChats: recentChats.sessions
      };
    } catch (error) {
      throw new AppError(`Error fetching recent activity: ${error.message}`, 500);
    }
  }

  /**
   * Get recent connections for a user
   * @param {string} userId - User ID
   * @param {number} limit - Maximum number of connections to return
   * @returns {Promise<object>} Object with connections array
   */
  static async getRecentConnections(userId, limit = 3) {
    try {
      return await ConnectionService.getRecentConnections(userId, limit);
    } catch (error) {
      throw new AppError(`Error fetching recent connections: ${error.message}`, 500);
    }
  }

  /**
   * Get recent chat sessions for a user
   * @param {string} userId - User ID
   * @param {number} limit - Maximum number of sessions to return
   * @returns {Promise<object>} Object with sessions array
   */
  static async getRecentChats(userId, limit = 5) {
    try {
      return await ChatService.getRecentSessions(userId, limit);
    } catch (error) {
      throw new AppError(`Error fetching recent chats: ${error.message}`, 500);
    }
  }
}

module.exports = DashboardService; 