const { promisePool } = require('../config/database');
const { AppError } = require('../middleware/error');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

class ApiKeyModel {
  /**
   * Generate a new API key string
   * @returns {string} Generated API key
   */
  static generateApiKeyString() {
    // Generate a shorter random string for the API key (prefix with 'sk_')
    // We're limiting to 16 bytes which gives us 32 hex chars plus the 'sk_' prefix for a total of 35 chars
    // The database column is 64 chars so this gives us plenty of room
    return 'sk_' + crypto.randomBytes(16).toString('hex');
  }

  /**
   * Create a new API key for a user
   * @param {string} userId - User ID
   * @param {string} name - Name/description for the API key
   * @returns {Promise<object>} The created API key details
   */
  static async create(userId, name) {
    try {
      const id = uuidv4();
      const apiKey = this.generateApiKeyString();

      console.log(`Creating API key with ID: ${id}, for user: ${userId}, with name: ${name}`);

      await promisePool.query(
        `INSERT INTO api_keys
         (id, user_id, api_key, name)
         VALUES (?, ?, ?, ?)`,
        [id, userId, apiKey, name]
      );

      console.log(`Successfully created API key with ID: ${id}`);

      return {
        id,
        user_id: userId,
        api_key: apiKey,
        name,
        is_active: true,
        created_at: new Date(),
        last_used: null,
        revoked_at: null
      };
    } catch (error) {
      console.error(`Detailed error creating API key: ${error.message}`);
      if (error.code) {
        console.error(`SQL Error code: ${error.code}`);
      }
      if (error.sqlMessage) {
        console.error(`SQL Message: ${error.sqlMessage}`);
      }
      
      throw new AppError(`Error creating API key: ${error.message}`, 500);
    }
  }

  /**
   * Find all API keys for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Array of API keys
   */
  static async findByUserId(userId) {
    try {
      const [rows] = await promisePool.query(
        `SELECT id, user_id, api_key, name, is_active, last_used, created_at, revoked_at
         FROM api_keys
         WHERE user_id = ?
         ORDER BY created_at DESC`,
        [userId]
      );
      
      return rows;
    } catch (error) {
      throw new AppError(`Error finding API keys: ${error.message}`, 500);
    }
  }

  /**
   * Find an API key by its ID
   * @param {string} id - API key ID
   * @param {string} userId - User ID (for verification)
   * @returns {Promise<object|null>} API key or null if not found
   */
  static async findById(id, userId) {
    try {
      const [rows] = await promisePool.query(
        `SELECT id, user_id, api_key, name, is_active, last_used, created_at, revoked_at
         FROM api_keys
         WHERE id = ? AND user_id = ?`,
        [id, userId]
      );
      
      return rows.length ? rows[0] : null;
    } catch (error) {
      throw new AppError(`Error finding API key: ${error.message}`, 500);
    }
  }

  /**
   * Find an API key by the key string
   * @param {string} apiKey - API key string
   * @returns {Promise<object|null>} API key or null if not found
   */
  static async findByKey(apiKey) {
    try {
      const [rows] = await promisePool.query(
        `SELECT id, user_id, api_key, name, is_active, last_used, created_at, revoked_at
         FROM api_keys
         WHERE api_key = ? AND is_active = TRUE AND revoked_at IS NULL`,
        [apiKey]
      );
      
      return rows.length ? rows[0] : null;
    } catch (error) {
      throw new AppError(`Error finding API key: ${error.message}`, 500);
    }
  }

  /**
   * Revoke (deactivate) an API key
   * @param {string} id - API key ID
   * @param {string} userId - User ID (for verification)
   * @returns {Promise<boolean>} True if successful
   */
  static async revoke(id, userId) {
    try {
      const [result] = await promisePool.query(
        `UPDATE api_keys
         SET is_active = FALSE, revoked_at = CURRENT_TIMESTAMP
         WHERE id = ? AND user_id = ?`,
        [id, userId]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw new AppError(`Error revoking API key: ${error.message}`, 500);
    }
  }

  /**
   * Update the last used timestamp for an API key
   * @param {string} id - API key ID
   * @returns {Promise<boolean>} True if successful
   */
  static async updateLastUsed(id) {
    try {
      await promisePool.query(
        `UPDATE api_keys
         SET last_used = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [id]
      );
      
      return true;
    } catch (error) {
      console.error(`Error updating API key last used: ${error.message}`);
      return false; // Non-critical error, don't throw
    }
  }

  /**
   * Log API key usage
   * @param {string} apiKeyId - API key ID
   * @param {string} endpoint - API endpoint used
   * @param {string} method - HTTP method (GET, POST, etc.)
   * @param {number} statusCode - HTTP status code
   * @returns {Promise<boolean>} True if successful
   */
  static async logUsage(apiKeyId, endpoint, method, statusCode) {
    try {
      const id = uuidv4();
      
      await promisePool.query(
        `INSERT INTO api_usage
         (id, api_key_id, endpoint, request_method, status_code)
         VALUES (?, ?, ?, ?, ?)`,
        [id, apiKeyId, endpoint, method, statusCode]
      );
      
      return true;
    } catch (error) {
      console.error(`Error logging API usage: ${error.message}`);
      return false; // Non-critical error, don't throw
    }
  }

  /**
   * Get usage statistics for an API key
   * @param {string} apiKeyId - API key ID
   * @param {string} userId - User ID (for verification)
   * @param {object} options - Options for filtering (e.g., period)
   * @returns {Promise<object>} Usage statistics
   */
  static async getUsageStats(apiKeyId, userId, options = {}) {
    try {
      // Check if the API key belongs to the user
      const apiKey = await this.findById(apiKeyId, userId);
      if (!apiKey) {
        throw new AppError('API key not found', 404);
      }
      
      // Default to monthly stats if period not specified
      const period = options.period || 'month';
      
      let timeConstraint;
      if (period === 'day') {
        timeConstraint = 'DATE(requested_at) = CURDATE()';
      } else if (period === 'week') {
        timeConstraint = 'YEARWEEK(requested_at) = YEARWEEK(CURDATE())';
      } else if (period === 'month') {
        timeConstraint = 'YEAR(requested_at) = YEAR(CURDATE()) AND MONTH(requested_at) = MONTH(CURDATE())';
      } else if (period === 'all') {
        timeConstraint = '1=1'; // No time constraint
      } else {
        throw new AppError('Invalid period specified', 400);
      }
      
      // Get total count
      const [countRows] = await promisePool.query(
        `SELECT COUNT(*) as total
         FROM api_usage
         WHERE api_key_id = ? AND ${timeConstraint}`,
        [apiKeyId]
      );
      
      // Get counts by status code (success vs. error)
      const [statusRows] = await promisePool.query(
        `SELECT
          SUM(CASE WHEN status_code >= 200 AND status_code < 300 THEN 1 ELSE 0 END) as success,
          SUM(CASE WHEN status_code >= 400 THEN 1 ELSE 0 END) as error
         FROM api_usage
         WHERE api_key_id = ? AND ${timeConstraint}`,
        [apiKeyId]
      );
      
      // Get counts by endpoint
      const [endpointRows] = await promisePool.query(
        `SELECT endpoint, COUNT(*) as count
         FROM api_usage
         WHERE api_key_id = ? AND ${timeConstraint}
         GROUP BY endpoint
         ORDER BY count DESC
         LIMIT 5`,
        [apiKeyId]
      );
      
      return {
        total: countRows[0].total,
        success: statusRows[0].success || 0,
        error: statusRows[0].error || 0,
        top_endpoints: endpointRows,
        period
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Error getting API usage stats: ${error.message}`, 500);
    }
  }
}

module.exports = ApiKeyModel; 