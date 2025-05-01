require('dotenv').config();
const fs = require('fs');
const path = require('path');

// Load environment variables with defaults
const config = {
  // Server configuration
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // JWT configuration
  jwtPrivateKeyPath: process.env.JWT_PRIVATE_KEY_PATH || path.join(__dirname, '..', 'private.key'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  
  // Python service configuration
  pythonServiceUrl: process.env.PYTHON_SERVICE_URL || 'http://localhost:8000',
  pythonServiceTimeout: process.env.PYTHON_SERVICE_TIMEOUT || 20000,
  
  // Database configuration (referenced from database.js)
  
  // Initialization function to validate required configs
  init: function() {
    // Validate that private key exists
    try {
      if (!fs.existsSync(this.jwtPrivateKeyPath)) {
        console.error(`JWT private key not found at ${this.jwtPrivateKeyPath}`);
        process.exit(1);
      }
      
      // Load the private key
      this.jwtPrivateKey = fs.readFileSync(this.jwtPrivateKeyPath, 'utf8');
      
      return true;
    } catch (error) {
      console.error('Error initializing app configuration:', error);
      return false;
    }
  }
};

module.exports = config; 