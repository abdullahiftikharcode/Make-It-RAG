const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

// Load Python configuration first
require('./python_config');

// Load configurations
const config = require('./config/app');
const { checkPythonServiceHealth } = require('./utils/python-health');

// Import middleware
const { errorHandler } = require('./middleware/error');
const { apiKeyAuth } = require('./middleware/api-auth');

// Import routes
const authRoutes = require('./routes/auth');
const connectionsRoutes = require('./routes/connections');
const chatRoutes = require('./routes/chat');
const profileRoutes = require('./routes/profile');
const settingsRoutes = require('./routes/settings');
const dashboardRoutes = require('./routes/dashboard');
const chatSessionsRoutes = require('./routes/chat-sessions');
const apiKeysRoutes = require('./routes/apikeys');
const billingRoutes = require('./routes/billing');

// Initialize app configurations
if (!config.init()) {
  console.error('Failed to initialize app configuration. Exiting...');
  process.exit(1);
}

// Initialize Express app
const app = express();

// Configure CORS
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://make-it-rag.vercel.app',
    /\.vercel\.app$/  // Allow all subdomains of vercel.app
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
  credentials: true,
  maxAge: 86400 // 24 hours
};

// Apply CORS configuration
app.use(cors(corsOptions));

// Configure middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Apply API key authentication (non-blocking) to all routes
app.use(apiKeyAuth);

// Register routes
app.use('/', authRoutes);
app.use('/api/connections', connectionsRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/chat-sessions', chatSessionsRoutes);
app.use('/api/apikeys', apiKeysRoutes);
app.use('/api/billing', billingRoutes);

// Register global error handler
app.use(errorHandler);

// Get port from environment variable
const PORT = process.env.PORT || 10000;

// Start the server
app.listen(PORT, async () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  
  // Check Python service health
  await checkPythonServiceHealth();
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Gracefully shutting down...');
  // Close any open connections or resources
  process.exit(0);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  // Log the error and exit
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason);
  // Log the rejection reason and continue
});
