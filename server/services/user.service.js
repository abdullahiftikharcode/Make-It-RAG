const UserModel = require('../models/user.model');
const SettingsModel = require('../models/settings.model');
const { AppError } = require('../middleware/error');

/**
 * User service for user-related operations
 */
class UserService {
  /**
   * Get user profile
   * @param {string} userId - User ID
   * @returns {Promise<object>} User profile data
   */
  static async getProfile(userId) {
    try {
      const user = await UserModel.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }
      
      // Return only the profile fields
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        bio: user.bio,
        company: user.company,
        image: user.image,
        subscription_tier: user.subscription_tier
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Error fetching profile: ${error.message}`, 500);
    }
  }

  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {object} profileData - Profile data to update
   * @returns {Promise<object>} Success message
   */
  static async updateProfile(userId, profileData) {
    try {
      // Parse first and last name into a single name field
      const { firstName, lastName, email, bio, company, image } = profileData;
      
      // Validate required fields
      if (!firstName || !lastName || !email) {
        throw new AppError('First name, last name, and email are required', 400);
      }
      
      // Combine first and last name
      const name = `${firstName} ${lastName}`;
      
      // Update the profile
      await UserModel.updateProfile(userId, {
        name,
        email,
        bio,
        company,
        image
      });
      
      return {
        message: 'Profile updated successfully'
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Error updating profile: ${error.message}`, 500);
    }
  }

  /**
   * Get user settings
   * @param {string} userId - User ID
   * @returns {Promise<object>} User settings
   */
  static async getSettings(userId) {
    try {
      const settings = await SettingsModel.findByUserId(userId);
      
      if (!settings) {
        // If no settings found, create default ones
        await SettingsModel.createDefault(userId);
        return {
          query_timeout: 30,
          show_sql_queries: true,
          theme: 'light'
        };
      }
      
      return settings;
    } catch (error) {
      throw new AppError(`Error fetching settings: ${error.message}`, 500);
    }
  }

  /**
   * Update user settings
   * @param {string} userId - User ID
   * @param {object} settingsData - Settings data to update
   * @returns {Promise<object>} Success message
   */
  static async updateSettings(userId, settingsData) {
    try {
      // Get the current settings to fill in any missing values
      const currentSettings = await this.getSettings(userId);
      
      // Merge current settings with new settings
      const settings = {
        query_timeout: settingsData.query_timeout !== undefined ? 
          settingsData.query_timeout : currentSettings.query_timeout,
        show_sql_queries: settingsData.show_sql_queries !== undefined ? 
          settingsData.show_sql_queries : currentSettings.show_sql_queries,
        theme: settingsData.theme || currentSettings.theme
      };
      
      // Update the settings
      await SettingsModel.update(userId, settings);
      
      return {
        message: 'Settings updated successfully'
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Error updating settings: ${error.message}`, 500);
    }
  }
}

module.exports = UserService; 