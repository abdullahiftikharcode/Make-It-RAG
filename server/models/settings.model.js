const { promisePool } = require('../config/database');
const { AppError } = require('../middleware/error');

class SettingsModel {
  /**
   * Get user settings
   * @param {string} userId - User ID
   * @returns {Promise<object|null>} Settings object or null if not found
   */
  static async findByUserId(userId) {
    try {
      const [rows] = await promisePool.query(
        `SELECT query_timeout, show_sql_queries, theme
         FROM user_settings
         WHERE user_id = ?`,
        [userId]
      );
      
      return rows.length ? rows[0] : null;
    } catch (error) {
      throw new AppError(`Error finding user settings: ${error.message}`, 500);
    }
  }

  /**
   * Update user settings
   * @param {string} userId - User ID
   * @param {object} settings - Settings object
   * @returns {Promise<boolean>} True if successful
   */
  static async update(userId, settings) {
    try {
      const { query_timeout, show_sql_queries, theme } = settings;
      
      const [result] = await promisePool.query(
        `UPDATE user_settings
         SET query_timeout = ?,
             show_sql_queries = ?,
             theme = ?,
             updated_at = CURRENT_TIMESTAMP
         WHERE user_id = ?`,
        [query_timeout, show_sql_queries, theme, userId]
      );
      
      if (result.affectedRows === 0) {
        // If no settings record exists, create one
        await promisePool.query(
          `INSERT INTO user_settings
           (user_id, query_timeout, show_sql_queries, theme)
           VALUES (?, ?, ?, ?)`,
          [userId, query_timeout, show_sql_queries, theme]
        );
      }
      
      return true;
    } catch (error) {
      throw new AppError(`Error updating user settings: ${error.message}`, 500);
    }
  }

  /**
   * Create default settings for a new user
   * @param {string} userId - User ID
   * @returns {Promise<boolean>} True if successful
   */
  static async createDefault(userId) {
    try {
      // Default values
      const defaults = {
        query_timeout: 30,
        show_sql_queries: true,
        theme: 'light'
      };
      
      await promisePool.query(
        `INSERT INTO user_settings
         (user_id, query_timeout, show_sql_queries, theme)
         VALUES (?, ?, ?, ?)`,
        [userId, defaults.query_timeout, defaults.show_sql_queries, defaults.theme]
      );
      
      return true;
    } catch (error) {
      console.error('Error creating default settings:', error);
      // Non-critical error, don't throw
      return false;
    }
  }
}

module.exports = SettingsModel; 