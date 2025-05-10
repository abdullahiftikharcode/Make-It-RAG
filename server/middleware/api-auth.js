const ApiKeyService = require('../services/apikey.service');

/**
 * Extract API key from request headers
 * @param {object} req - Express request object
 * @returns {string|null} API key or null
 */
const extractApiKey = (req) => {
  // Check for 'x-api-key' header (preferred)
  if (req.headers['x-api-key']) {
    return req.headers['x-api-key'];
  }
  
  // Check for 'Authorization' header with 'Bearer <token>' format
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7); // Remove 'Bearer ' prefix
  }
  
  // Check query parameter as a fallback (not recommended for production)
  if (req.query.api_key) {
    return req.query.api_key;
  }
  
  return null;
};

/**
 * Middleware to validate API key and set user context
 * This middleware doesn't reject requests without API keys,
 * but flags them for further permission checks
 */
const apiKeyAuth = async (req, res, next) => {
  // Extract API key from request
  const apiKey = extractApiKey(req);
  
  // Set apiAuth flag to false by default
  req.apiAuth = { authenticated: false };
  
  if (apiKey) {
    // Validate the API key
    const result = await ApiKeyService.validateApiKey(apiKey);
    
    if (result) {
      // Set authenticated flag and user info
      req.apiAuth = {
        authenticated: true,
        userId: result.userId,
        keyId: result.keyId,
        method: req.method,
        path: req.path
      };
      
      // Log the API usage (non-blocking)
      setTimeout(() => {
        ApiKeyService.logApiKeyUsage(
          result.keyId,
          req.path,
          req.method,
          res.statusCode || 200
        );
      }, 0);
    }
  }
  
  // Always continue to the next middleware
  next();
};

/**
 * Middleware to require API key authentication
 * This middleware rejects requests without valid API keys
 */
const requireApiKey = async (req, res, next) => {
  // First run the apiKeyAuth middleware to authenticate the request
  await apiKeyAuth(req, res, (err) => {
    if (err) return next(err);
    
    // Check if the request was authenticated
    if (!req.apiAuth || !req.apiAuth.authenticated) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'A valid API key is required to access this resource'
      });
    }
    
    // If authenticated, continue to the next middleware
    next();
  });
};

module.exports = {
  apiKeyAuth,
  requireApiKey
}; 