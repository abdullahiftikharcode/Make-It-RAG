const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');

// Load Python configuration first
require('./python_config');

// Load configurations
const config = require('./config/app');
const { checkPythonServiceHealth } = require('./utils/python-health');

// Import middleware
const { errorHandler } = require('./middleware/error');

// Import routes
const authRoutes = require('./routes/auth');
const connectionsRoutes = require('./routes/connections');
const chatRoutes = require('./routes/chat');
const profileRoutes = require('./routes/profile');
const settingsRoutes = require('./routes/settings');
const dashboardRoutes = require('./routes/dashboard');
const chatSessionsRoutes = require('./routes/chat-sessions');

// Initialize app configurations
if (!config.init()) {
  console.error('Failed to initialize app configuration. Exiting...');
  process.exit(1);
}

// Initialize Express app
const app = express();

// Configure middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// MySQL connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});
db.connect((err) => {
  if (err) {
      console.error('Error connecting to MySQL:', err.code, err.sqlMessage);
      return;
  }
  console.log('Connected to MySQL');
});

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.jwt.privateKey, { algorithms: ['RS256'] });
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Register routes
app.use('/', authRoutes); // Auth routes are at the root level
app.use('/api/connections', connectionsRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api', chatRoutes); // Register chat routes at /api level for backwards compatibility
app.use('/api/profile', profileRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/chat-sessions', chatSessionsRoutes);

// Map the /api/change-password to the auth routes' change-password endpoint
app.use('/api', authRoutes);

// Legacy endpoint for schema (redirect to new endpoint)
app.get('/api/schema/:connectionId', (req, res) => {
  res.redirect(`/api/connections/${req.params.connectionId}/schema`);
});

// Register global error handler
app.use(errorHandler);

// Start the server
app.listen(config.port, async () => {
  console.log(`Server is running on http://localhost:${config.port}`);
  
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
