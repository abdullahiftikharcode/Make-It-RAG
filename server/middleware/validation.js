/**
 * Simple validation middleware
 * Takes validation rules and applies them to the request body
 */
const validateRequest = (validationRules) => {
  return (req, res, next) => {
    const errors = {};
    
    for (const field in validationRules) {
      const value = req.body[field];
      const rules = validationRules[field];
      
      // Check required fields
      if (rules.required && (value === undefined || value === null || value === '')) {
        errors[field] = `${field} is required`;
        continue;
      }
      
      // Skip other validations if field is not provided and not required
      if (value === undefined || value === null || value === '') {
        continue;
      }
      
      // Check min length
      if (rules.minLength && value.length < rules.minLength) {
        errors[field] = `${field} must be at least ${rules.minLength} characters`;
      }
      
      // Check max length
      if (rules.maxLength && value.length > rules.maxLength) {
        errors[field] = `${field} must be at most ${rules.maxLength} characters`;
      }
      
      // Check pattern with regex
      if (rules.pattern && !rules.pattern.test(value)) {
        errors[field] = rules.message || `${field} has an invalid format`;
      }
      
      // Check custom validation
      if (rules.validate && typeof rules.validate === 'function') {
        const customError = rules.validate(value, req.body);
        if (customError) {
          errors[field] = customError;
        }
      }
      
      // Check enum values
      if (rules.enum && !rules.enum.includes(value)) {
        errors[field] = `${field} must be one of: ${rules.enum.join(', ')}`;
      }
    }
    
    // If there are validation errors, return them
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors });
    }
    
    // If validation passes, proceed to the next middleware
    next();
  };
};

module.exports = {
  validateRequest
}; 