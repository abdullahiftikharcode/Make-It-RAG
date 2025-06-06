const { promisePool } = require('../config/database');
const { AppError } = require('../middleware/error');
const { v4: uuidv4 } = require('uuid');

class ConnectionModel {
  /**
   * Find a connection by ID and user ID
   * @param {string} connectionId - Connection ID
   * @param {string} userId - User ID
   * @returns {Promise<object|null>} Connection object or null if not found
   */
  static async findById(connectionId, userId) {
    try {
      const [rows] = await promisePool.query(
        `SELECT * FROM database_connections 
         WHERE id = ? AND user_id = ?`,
        [connectionId, userId]
      );
      return rows.length ? rows[0] : null;
    } catch (error) {
      throw new AppError(`Error finding connection: ${error.message}`, 500);
    }
  }

  /**
   * Get all connections for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Array of connection objects
   */
  static async findAllByUser(userId) {
    try {
      const [rows] = await promisePool.query(
        `SELECT 
           id,
           name,
           connection_string,
           type AS dialect,
           created_at,
           last_used,
           is_active
         FROM database_connections
         WHERE user_id = ?
         ORDER BY last_used DESC, created_at DESC`,
        [userId]
      );
      
      // Transform the data to include dummy fields
      // These should be real values in a production environment
      return rows.map(connection => ({
        id: connection.id,
        name: connection.name,
        connectionString: connection.connection_string,
        dialect: connection.dialect,
        createdAt: connection.created_at,
        lastUsed: connection.last_used,
        isActive: connection.is_active,
        // These are dummy fields
        size: "1.2 GB",
        version: "14.5",
        queries: 156,
        tables: 24,
      }));
    } catch (error) {
      throw new AppError(`Error finding connections: ${error.message}`, 500);
    }
  }

  /**
   * Get recent connections for a user
   * @param {string} userId - User ID
   * @param {number} limit - Maximum number of connections to return
   * @returns {Promise<Array>} Array of connection objects
   */
  static async findRecentByUser(userId, limit = 3) {
    try {
      const [rows] = await promisePool.query(
        `SELECT id, name, type, created_at, last_used, is_active
         FROM database_connections
         WHERE user_id = ?
         ORDER BY last_used DESC
         LIMIT ?`,
        [userId, limit]
      );
      return rows.map(row => ({
        id: row.id,
        name: row.name,
        type: row.type,
        isActive: row.is_active
      }));
    } catch (error) {
      throw new AppError(`Error finding recent connections: ${error.message}`, 500);
    }
  }

  /**
   * Create a new connection
   * @param {object} connectionData - Connection data object
   * @param {string} userId - User ID
   * @returns {Promise<object>} Created connection object
   */
  static async create(connectionData, userId) {
    try {
      const connectionId = uuidv4();
      const { name, type, connectionString } = connectionData;
      
      const [result] = await promisePool.query(
        `INSERT INTO database_connections 
         (id, user_id, name, type, connection_string, is_active)
         VALUES (?, ?, ?, ?, ?, true)`,
        [connectionId, userId, name, type, connectionString]
      );
      
      return {
        id: connectionId,
        name,
        type,
        isActive: true
      };
    } catch (error) {
      throw new AppError(`Error creating connection: ${error.message}`, 500);
    }
  }

  /**
   * Delete a connection
   * @param {string} connectionId - Connection ID
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} True if successful, false if not found
   */
  static async delete(connectionId, userId) {
    try {
      const [result] = await promisePool.query(
        "DELETE FROM database_connections WHERE id = ? AND user_id = ?",
        [connectionId, userId]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw new AppError(`Error deleting connection: ${error.message}`, 500);
    }
  }

  /**
   * Update connection status (active/inactive)
   * @param {string} connectionId - Connection ID
   * @param {string} userId - User ID
   * @param {boolean} isActive - Active status
   * @returns {Promise<boolean>} True if successful, false if not found
   */
  static async updateStatus(connectionId, userId, isActive) {
    try {
      const [result] = await promisePool.query(
        `UPDATE database_connections 
         SET is_active = ?, last_used = NOW() 
         WHERE id = ? AND user_id = ?`,
        [isActive, connectionId, userId]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw new AppError(`Error updating connection status: ${error.message}`, 500);
    }
  }

  /**
   * Update last used timestamp
   * @param {string} connectionId - Connection ID
   * @returns {Promise<void>}
   */
  static async updateLastUsed(connectionId) {
    try {
      await promisePool.query(
        "UPDATE database_connections SET last_used = NOW() WHERE id = ?",
        [connectionId]
      );
    } catch (error) {
      console.error('Error updating last used timestamp:', error);
      // Non-critical error, don't throw
    }
  }

  /**
   * Find or create a connection
   * @param {string} connectionString - Connection string
   * @param {string} userId - User ID
   * @returns {Promise<object>} Connection object
   */
  static async findOrCreate(connectionString, userId) {
    const conn = await promisePool.getConnection();
    try {
      await conn.beginTransaction();
      
      // First try to find an existing connection
      const [existing] = await conn.query(
        `SELECT * FROM database_connections 
         WHERE connection_string = ? AND user_id = ?`,
        [connectionString, userId]
      );
      
      if (existing.length > 0) {
        // Update last_used and is_active if found
        await conn.query(
          `UPDATE database_connections 
           SET last_used = NOW(), is_active = true 
           WHERE id = ?`,
          [existing[0].id]
        );
        
        await conn.commit();
        return existing[0];
      }
      
      // If not found, create a new connection
      const connectionId = uuidv4();
      const name = `MySQL Connection ${new Date().toLocaleString()}`;
      
      await conn.query(
        `INSERT INTO database_connections 
         (id, user_id, name, type, connection_string, is_active)
         VALUES (?, ?, ?, ?, ?, true)`,
        [connectionId, userId, name, 'mysql', connectionString]
      );
      
      await conn.commit();
      
      return {
        id: connectionId,
        user_id: userId,
        name,
        type: 'mysql',
        connection_string: connectionString,
        is_active: true
      };
    } catch (error) {
      await conn.rollback();
      throw new AppError(`Error finding/creating connection: ${error.message}`, 500);
    } finally {
      conn.release();
    }
  }
}

module.exports = ConnectionModel; 