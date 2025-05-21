const { promisePool } = require('../config/database');
const { AppError } = require('../middleware/error');
const { v4: uuidv4 } = require('uuid');

class UserModel {
  /**
   * Find a user by ID
   * @param {string} userId - User ID
   * @returns {Promise<object|null>} User object or null if not found
   */
    static async findById(userId) {    try {      const [rows] = await promisePool.query(        `SELECT id, name, email, bio, company, role, is_active, subscription_tier,         IF(image IS NOT NULL, CONCAT('data:image/jpeg;base64,', TO_BASE64(image)), null) as image         FROM users WHERE id = ?`,        [userId]      );      return rows.length ? rows[0] : null;
    } catch (error) {
      throw new AppError(`Error finding user: ${error.message}`, 500);
    }
  }

  /**
   * Find a user by email
   * @param {string} email - User email
   * @returns {Promise<object|null>} User object or null if not found
   */
  static async findByEmail(email) {
    try {
      const [rows] = await promisePool.query(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      return rows.length ? rows[0] : null;
    } catch (error) {
      throw new AppError(`Error finding user by email: ${error.message}`, 500);
    }
  }

  /**
   * Create a new user
   * @param {object} userData - User data object
   * @returns {Promise<object>} Created user object
   */
    static async create(userData) {    try {      const userId = uuidv4();      const { name, email, passwordHash, role = 'user', subscription_tier = 'personal' } = userData;            const [result] = await promisePool.query(        `INSERT INTO users (id, name, email, password_hash, role, subscription_tier)         VALUES (?, ?, ?, ?, ?, ?)`,        [userId, name, email, passwordHash, role, subscription_tier]      );            // Create default user settings      await promisePool.query(        'INSERT INTO user_settings (user_id) VALUES (?)',        [userId]      );            return { userId, name, email, role, subscription_tier };
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new AppError('Email already in use', 400);
      }
      throw new AppError(`Error creating user: ${error.message}`, 500);
    }
  }

  /**
   * Update a user's profile
   * @param {string} userId - User ID
   * @param {object} userData - User data to update
   * @returns {Promise<boolean>} True if successful
   */
  static async updateProfile(userId, userData) {
    try {
      const { name, email, bio, company, image } = userData;
      
      // Process the image field
      let imageBuffer = null;
      if (image) {
        const base64Data = image.includes(',') ? image.split(',')[1] : image;
        imageBuffer = Buffer.from(base64Data, 'base64');
      }
      
      const [result] = await promisePool.query(
        `UPDATE users
         SET name = ?, email = ?, bio = ?, company = ?, image = ?
         WHERE id = ?`,
        [name, email, bio, company, imageBuffer, userId]
      );
      
      if (result.affectedRows === 0) {
        throw new AppError('User not found', 404);
      }
      
      return true;
    } catch (error) {
      throw new AppError(`Error updating profile: ${error.message}`, 500);
    }
  }

  /**
   * Update a user's password
   * @param {string} userId - User ID
   * @param {string} passwordHash - New password hash
   * @returns {Promise<boolean>} True if successful
   */
  static async updatePassword(userId, passwordHash) {
    try {
      const [result] = await promisePool.query(
        'UPDATE users SET password_hash = ? WHERE id = ?',
        [passwordHash, userId]
      );
      
      if (result.affectedRows === 0) {
        throw new AppError('User not found', 404);
      }
      
      return true;
    } catch (error) {
      throw new AppError(`Error updating password: ${error.message}`, 500);
    }
  }

  /**
   * Update user's last login timestamp
   * @param {string} userId - User ID
   * @returns {Promise<void>}
   */
  static async updateLastLogin(userId) {
    try {
      await promisePool.query(
        'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
        [userId]
      );
    } catch (error) {
      console.error('Error updating last login:', error);
      // Non-critical error, don't throw
    }
  }
}

module.exports = UserModel; 