const config = require('../config/app');
const { AppError } = require('../middleware/error');

/**
 * Service for communicating with the Python FastAPI server
 */
class PythonService {
  /**
   * Generate SQL query from natural language
   * @param {string} query - Natural language query
   * @param {string} dbUrl - Database connection string
   * @param {string} dialect - SQL dialect (e.g., 'MYSQL', 'POSTGRESQL')
   * @param {object} settings - Query settings
   * @returns {Promise<object>} Generated SQL and explanation
   */
  static async generateSQL(query, dbUrl, dialect, settings = {}) {
    try {
      const pythonRequest = {
        query: query,
        db_url: dbUrl,
        dialect: dialect.toUpperCase(),
        settings: {
          query_timeout: settings?.query_timeout || 45
        }
      };
      
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), config.pythonServiceTimeout);
      
      try {
        const response = await fetch(`${config.pythonServiceUrl}/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(pythonRequest),
          signal: controller.signal
        });
        
        clearTimeout(timeout);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new AppError(errorData.detail || 'Error from Python server', response.status);
        }
        
        return await response.json();
      } catch (error) {
        clearTimeout(timeout);
        
        if (error.name === 'AbortError') {
          throw new AppError('Query processing timed out', 504, 
            'The query took too long to process. Please try a simpler query or contact support if the problem persists.');
        }
        
        // Check if Python server is not running
        if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
          throw new AppError('Database service is not available', 503,
            'The Python FastAPI server is not running or cannot be reached.');
        }
        
        throw error;
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Error generating SQL: ${error.message}`, 500);
    }
  }
  
  /**
   * Get database schema
   * @param {string} dbUrl - Database connection string
   * @returns {Promise<object>} Database schema
   */
  static async getSchema(dbUrl) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), config.pythonServiceTimeout);
      
      try {
        const response = await fetch(
          `${config.pythonServiceUrl}/schema?db_url=${encodeURIComponent(dbUrl)}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            signal: controller.signal
          }
        );
        
        clearTimeout(timeout);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new AppError(errorData.detail || 'Error from Python server', response.status);
        }
        
        return await response.json();
      } catch (error) {
        clearTimeout(timeout);
        
        if (error.name === 'AbortError') {
          throw new AppError('Schema fetch timed out', 504,
            'The database took too long to respond. This might happen if the database is under heavy load or if there are many tables to analyze.');
        }
        
        // Check if Python server is not running
        if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
          throw new AppError('Database service is not available', 503,
            'The schema service requires the Python FastAPI server to be running.');
        }
        
        throw error;
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Error fetching schema: ${error.message}`, 500);
    }
  }
  
  /**
   * Check if the Python service is healthy
   * @returns {Promise<boolean>} True if healthy
   */
  static async checkHealth() {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000); // Short timeout for health check
      
      try {
        const response = await fetch(`${config.pythonServiceUrl}/health`, {
          method: 'GET',
          signal: controller.signal
        });
        
        clearTimeout(timeout);
        return response.ok;
      } catch (error) {
        clearTimeout(timeout);
        return false;
      }
    } catch (error) {
      return false;
    }
  }
}

module.exports = PythonService; 