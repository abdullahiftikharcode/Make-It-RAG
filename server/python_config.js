/**
 * Python server configuration override
 * This file is loaded by the server to override the default Python service URL
 */

// Override the default Python service URL to match the port your Python server is running on
process.env.PYTHON_SERVICE_URL = 'https://make-it-rag-1.onrender.com';

// Log the configuration to confirm it's loaded
console.log('Python service URL configured:', process.env.PYTHON_SERVICE_URL); 