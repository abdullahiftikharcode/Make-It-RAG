const jwt = require('jsonwebtoken');
const config = require('../config/app');

/**
 * Middleware to verify JWT token
 * Checks for the Authorization header, verifies the token,
 * and attaches the decoded user info to the request object
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.jwtPrivateKey, { algorithms: ['RS256'] });
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

/**
 * Middleware to verify admin role
 * Must be used after verifyToken middleware
 */
const verifyAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin privileges required' });
  }
  
  next();
};

module.exports = {
  verifyToken,
  verifyAdmin
}; 