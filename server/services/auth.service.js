const CryptoJS = require('crypto-js');
const jwt = require('jsonwebtoken');
const config = require('../config/app');
const UserModel = require('../models/user.model');
const { AppError } = require('../middleware/error');

/**
 * Authentication service
 */
class AuthService {
  /**
   * Register a new user
   * @param {object} userData - User registration data
   * @returns {Promise<object>} User data and JWT token
   */
  static async register(userData) {
    try {
      const { name, email, password } = userData;
      
      // Validate input
      if (!name || !email || !password) {
        throw new AppError('Missing required fields', 400);
      }
      
      // Check if user already exists
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        throw new AppError('User already exists', 400);
      }
      
      // Hash the password
      const passwordHash = CryptoJS.SHA256(password).toString();
      
      // Create the user
      const user = await UserModel.create({ name, email, passwordHash });
      
      // Generate JWT token
      const token = this.generateToken(user);
      
      return {
        message: 'User created successfully',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        token
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Error in registration: ${error.message}`, 500);
    }
  }
  
  /**
   * Authenticate a user
   * @param {object} credentials - User credentials
   * @returns {Promise<object>} User data and JWT token
   */
  static async login(credentials) {
    try {
      const { email, password } = credentials;
      
      // Validate input
      if (!email || !password) {
        throw new AppError('Email and password are required', 400);
      }
      
      // Find the user
      const user = await UserModel.findByEmail(email);
      if (!user) {
        throw new AppError('Invalid credentials', 401);
      }
      
      // Check if account is active
      if (!user.is_active) {
        throw new AppError('Account is deactivated', 401);
      }
      
      // Verify password
      const passwordHash = CryptoJS.SHA256(password).toString();
      if (user.password_hash !== passwordHash) {
        throw new AppError('Invalid credentials', 401);
      }
      
      // Update last login timestamp
      await UserModel.updateLastLogin(user.id);
      
      // Generate JWT token
      const token = this.generateToken(user);
      
      return {
        message: 'Successfully logged in',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Error in login: ${error.message}`, 500);
    }
  }
  
  /**
   * Change user password
   * @param {string} userId - User ID
   * @param {object} passwordData - Password data
   * @returns {Promise<object>} Success message
   */
  static async changePassword(userId, passwordData) {
    try {
      const { currentPassword, newPassword } = passwordData;
      
      // Validate input
      if (!currentPassword || !newPassword) {
        throw new AppError('Current password and new password are required', 400);
      }
      
      // Find the user
      const user = await UserModel.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }
      
      // Verify current password
      const currentPasswordHash = CryptoJS.SHA256(currentPassword).toString();
      if (user.password_hash !== currentPasswordHash) {
        throw new AppError('Current password is incorrect', 400);
      }
      
      // Update password
      const newPasswordHash = CryptoJS.SHA256(newPassword).toString();
      await UserModel.updatePassword(userId, newPasswordHash);
      
      return {
        message: 'Password updated successfully'
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Error changing password: ${error.message}`, 500);
    }
  }
  
  /**
   * Generate JWT token
   * @param {object} user - User object
   * @returns {string} JWT token
   */
  static generateToken(user) {
    return jwt.sign(
      { userId: user.id, role: user.role },
      config.jwtPrivateKey,
      { algorithm: 'RS256', expiresIn: config.jwtExpiresIn }
    );
  }
  
  /**
   * Validate JWT token
   * @param {string} token - JWT token
   * @returns {object} Decoded token payload
   */
  static validateToken(token) {
    try {
      return jwt.verify(token, config.jwtPrivateKey, { algorithms: ['RS256'] });
    } catch (error) {
      throw new AppError('Invalid or expired token', 401);
    }
  }
}

module.exports = AuthService; 