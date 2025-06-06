const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { errorHandler } = require('./middleware/error');

// Import routes
const authRoutes = require('./routes/auth');
const connectionsRoutes = require('./routes/connections');
const chatRoutes = require('./routes/chat');
const chatSessionsRoutes = require('./routes/chat-sessions');
const settingsRoutes = require('./routes/settings');
const billingRoutes = require('./routes/billing');
const apiKeysRoutes = require('./routes/apikeys');
const schemaRoutes = require('./routes/schema');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/connections', connectionsRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/chat-sessions', chatSessionsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/api-keys', apiKeysRoutes);
app.use('/api/schema', schemaRoutes);

// Error handling
app.use(errorHandler);

module.exports = app; 