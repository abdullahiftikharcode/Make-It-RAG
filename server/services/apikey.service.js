const ApiKeyModel = require('../models/apikey.model');
const UserModel = require('../models/user.model');
const { AppError } = require('../middleware/error');

/**
 * API Key service for managing API keys
 */
class ApiKeyService {
  /**
   * Generate a new API key for a user
   * @param {string} userId - User ID
   * @param {string} name - Name/description for the API key
   * @returns {Promise<object>} The generated API key
   */
  static async generateApiKey(userId, name = 'Default API Key') {
    try {
      // Check if user exists
      const user = await UserModel.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }
      
      // Generate a new API key
      const apiKey = await ApiKeyModel.create(userId, name);
      
      return apiKey;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Error generating API key: ${error.message}`, 500);
    }
  }

  /**
   * Get all API keys for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Array of API keys
   */
  static async getApiKeys(userId) {
    try {
      // Get all API keys for the user
      const apiKeys = await ApiKeyModel.findByUserId(userId);
      
      // Send both masked and full key values
      return apiKeys.map(key => {
        const maskedKey = key.api_key.slice(0, 7) + '...' + key.api_key.slice(-4);
        return {
          ...key,
          api_key: key.api_key, // Send full key for copying
          display_key: maskedKey, // Send masked key for display
          last_used_date: key.last_used ? new Date(key.last_used).toISOString() : null,
          created_date: new Date(key.created_at).toISOString(),
          revoked_date: key.revoked_at ? new Date(key.revoked_at).toISOString() : null
        };
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Error getting API keys: ${error.message}`, 500);
    }
  }

  /**
   * Get a specific API key
   * @param {string} keyId - API key ID
   * @param {string} userId - User ID
   * @returns {Promise<object>} API key details
   */
  static async getApiKey(keyId, userId) {
    try {
      // Find the API key
      const apiKey = await ApiKeyModel.findById(keyId, userId);
      
      if (!apiKey) {
        throw new AppError('API key not found', 404);
      }
      
      // Create masked key for display but keep full key for copying
      const maskedKey = apiKey.api_key.slice(0, 7) + '...' + apiKey.api_key.slice(-4);
      
      return {
        ...apiKey,
        api_key: apiKey.api_key, // Keep full key for copying
        display_key: maskedKey, // Add masked key for display
        last_used_date: apiKey.last_used ? new Date(apiKey.last_used).toISOString() : null,
        created_date: new Date(apiKey.created_at).toISOString(),
        revoked_date: apiKey.revoked_at ? new Date(apiKey.revoked_at).toISOString() : null
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Error getting API key: ${error.message}`, 500);
    }
  }

  /**
   * Revoke an API key
   * @param {string} keyId - API key ID
   * @param {string} userId - User ID
   * @returns {Promise<object>} Success message
   */
  static async revokeApiKey(keyId, userId) {
    try {
      // Check if the key exists
      const apiKey = await ApiKeyModel.findById(keyId, userId);
      
      if (!apiKey) {
        throw new AppError('API key not found', 404);
      }
      
      // Check if it's already revoked
      if (!apiKey.is_active || apiKey.revoked_at) {
        throw new AppError('API key is already revoked', 400);
      }
      
      // Revoke the key
      await ApiKeyModel.revoke(keyId, userId);
      
      return {
        message: 'API key revoked successfully'
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Error revoking API key: ${error.message}`, 500);
    }
  }

  /**
   * Get usage statistics for an API key
   * @param {string} keyId - API key ID
   * @param {string} userId - User ID
   * @param {string} period - Time period (day, week, month, all)
   * @returns {Promise<object>} Usage statistics
   */
  static async getApiKeyUsageStats(keyId, userId, period = 'month') {
    try {
      return await ApiKeyModel.getUsageStats(keyId, userId, { period });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Error getting API key usage stats: ${error.message}`, 500);
    }
  }

  /**
   * Validate an API key and identify the corresponding user
   * @param {string} apiKey - API key string
   * @returns {Promise<object|null>} User ID or null if invalid
   */
  static async validateApiKey(apiKey) {
    try {
      if (!apiKey) return null;
      
      // Find the API key in the database
      const key = await ApiKeyModel.findByKey(apiKey);
      
      if (!key || !key.is_active || key.revoked_at) {
        return null;
      }
      
      // Update last used timestamp (non-blocking)
      ApiKeyModel.updateLastUsed(key.id);
      
      return {
        userId: key.user_id,
        keyId: key.id
      };
    } catch (error) {
      console.error('Error validating API key:', error);
      return null; // Return null instead of throwing for authentication middleware
    }
  }

  /**
   * Log API key usage
   * @param {string} keyId - API key ID
   * @param {string} endpoint - API endpoint
   * @param {string} method - HTTP method
   * @param {number} statusCode - HTTP status code
   * @returns {Promise<void>}
   */
  static async logApiKeyUsage(keyId, endpoint, method, statusCode) {
    if (!keyId) return;
    
    // Log asynchronously (don't await)
    ApiKeyModel.logUsage(keyId, endpoint, method, statusCode)
      .catch(err => console.error('Error logging API key usage:', err));
  }
}

module.exports = ApiKeyService; 