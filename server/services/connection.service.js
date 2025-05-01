const ConnectionModel = require('../models/connection.model');
const PythonService = require('./python.service');
const { AppError } = require('../middleware/error');

/**
 * Connection service for database connections
 */
class ConnectionService {
  /**
   * Get all connections for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Array of connections
   */
  static async getAllConnections(userId) {
    try {
      return await ConnectionModel.findAllByUser(userId);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Error fetching connections: ${error.message}`, 500);
    }
  }

  /**
   * Get a specific connection
   * @param {string} connectionId - Connection ID
   * @param {string} userId - User ID
   * @returns {Promise<object>} Connection object
   */
  static async getConnection(connectionId, userId) {
    try {
      const connection = await ConnectionModel.findById(connectionId, userId);
      
      if (!connection) {
        throw new AppError('Connection not found', 404);
      }
      
      return connection;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Error fetching connection: ${error.message}`, 500);
    }
  }

  /**
   * Create a new connection
   * @param {object} connectionData - Connection data
   * @param {string} userId - User ID
   * @returns {Promise<object>} Created connection
   */
  static async createConnection(connectionData, userId) {
    try {
      const { name, type, connectionString } = connectionData;
      
      // Validate required fields
      if (!name || !type || !connectionString) {
        throw new AppError('Missing required fields', 400);
      }
      
      // Validate database type
      const validTypes = ['postgresql', 'mysql', 'sqlserver'];
      if (!validTypes.includes(type)) {
        throw new AppError('Invalid database type', 400);
      }
      
      // Verify that the connection string works by testing connection
      try {
        await PythonService.getSchema(connectionString);
      } catch (error) {
        throw new AppError('Could not connect to database', 400, 
          'Failed to establish a connection. Please verify your connection string.');
      }
      
      // Create the connection
      return await ConnectionModel.create({ name, type, connectionString }, userId);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Error creating connection: ${error.message}`, 500);
    }
  }

  /**
   * Delete a connection
   * @param {string} connectionId - Connection ID
   * @param {string} userId - User ID
   * @returns {Promise<object>} Success message
   */
  static async deleteConnection(connectionId, userId) {
    try {
      const deleted = await ConnectionModel.delete(connectionId, userId);
      
      if (!deleted) {
        throw new AppError('Connection not found', 404);
      }
      
      return {
        message: 'Connection deleted successfully'
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Error deleting connection: ${error.message}`, 500);
    }
  }

  /**
   * Test and reactivate a connection
   * @param {string} connectionId - Connection ID
   * @param {string} userId - User ID
   * @returns {Promise<object>} Updated connection
   */
  static async reconnectConnection(connectionId, userId) {
    try {
      // First verify that the connection belongs to the user
      const connection = await ConnectionModel.findById(connectionId, userId);
      
      if (!connection) {
        throw new AppError('Connection not found', 404);
      }
      
      // Test the connection by trying to fetch the schema
      try {
        await PythonService.getSchema(connection.connection_string);
      } catch (error) {
        throw new AppError('Failed to connect to database', 400,
          'Could not establish a connection to the database. Please verify your connection details.');
      }
      
      // If we get here, the connection is working, so update it to active
      const updated = await ConnectionModel.updateStatus(connectionId, userId, true);
      
      if (!updated) {
        throw new AppError('Failed to update connection status', 500);
      }
      
      return {
        message: 'Connection reactivated successfully',
        connection: {
          id: connection.id,
          name: connection.name,
          type: connection.type,
          isActive: true
        }
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Error reconnecting: ${error.message}`, 500);
    }
  }

  /**
   * Get database schema for a connection
   * @param {string} connectionId - Connection ID
   * @param {string} userId - User ID
   * @returns {Promise<object>} Database schema
   */
  static async getConnectionSchema(connectionId, userId) {
    try {
      // First verify that the connection belongs to the user
      const connection = await ConnectionModel.findById(connectionId, userId);
      
      if (!connection) {
        throw new AppError('Connection not found', 404);
      }
      
      // Get the schema from the Python service
      const schema = await PythonService.getSchema(connection.connection_string);
      
      // Update the last used timestamp
      await ConnectionModel.updateLastUsed(connectionId);
      
      return schema;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Error fetching schema: ${error.message}`, 500);
    }
  }

  /**
   * Get recent connections for a user
   * @param {string} userId - User ID
   * @param {number} limit - Maximum number of connections to return
   * @returns {Promise<Array>} Array of connections
   */
  static async getRecentConnections(userId, limit = 3) {
    try {
      const connections = await ConnectionModel.findRecentByUser(userId, limit);
      return { connections };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Error fetching recent connections: ${error.message}`, 500);
    }
  }
}

module.exports = ConnectionService; 