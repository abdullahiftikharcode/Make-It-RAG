const PythonService = require('../services/python.service');

/**
 * Check if Python service is healthy
 * If not, log a warning
 * @returns {Promise<boolean>} True if healthy
 */
const checkPythonServiceHealth = async () => {
  try {
    const isHealthy = await PythonService.checkHealth();
    
    if (!isHealthy) {
      console.warn('[WARNING] Python FastAPI server is not running or not responding.');
      console.warn('Some features that require natural language processing may not work.');
      console.warn('Make sure the Python server is running on the correct port.');
    } else {
      console.log('Python FastAPI server is running and healthy.');
    }
    
    return isHealthy;
  } catch (error) {
    console.error('Error checking Python service health:', error);
    return false;
  }
};

module.exports = {
  checkPythonServiceHealth
}; 