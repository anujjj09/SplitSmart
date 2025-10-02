/**
 * Validation middleware for request data
 */

/**
 * Validate group creation data
 */
function validateGroup(req, res, next) {
  const { name } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({
      error: {
        message: 'Group name is required and must be a non-empty string',
        field: 'name'
      }
    });
  }

  if (name.length > 100) {
    return res.status(400).json({
      error: {
        message: 'Group name must be less than 100 characters',
        field: 'name'
      }
    });
  }

  // Sanitize data
  req.body.name = name.trim();
  if (req.body.description) {
    req.body.description = req.body.description.trim();
  }

  next();
}

/**
 * Validate member data
 */
function validateMember(req, res, next) {
  const { name, email } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({
      error: {
        message: 'Member name is required and must be a non-empty string',
        field: 'name'
      }
    });
  }

  if (name.length > 50) {
    return res.status(400).json({
      error: {
        message: 'Member name must be less than 50 characters',
        field: 'name'
      }
    });
  }

  // Basic email validation if provided
  if (email && email.trim().length > 0) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        error: {
          message: 'Invalid email format',
          field: 'email'
        }
      });
    }
  }

  // Sanitize data
  req.body.name = name.trim();
  if (email) {
    req.body.email = email.trim().toLowerCase();
  }

  next();
}

/**
 * Validate expense data
 */
const validateExpense = (req, res, next) => {
  console.log('=== EXPENSE VALIDATION DEBUG ===');
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  console.log('Content-Type:', req.headers['content-type']);
  
  const { description, amount, splitType, splitBetween, paidBy, paidByMultiple } = req.body;
  
  // Validate description
  if (!description || typeof description !== 'string' || description.trim() === '') {
    console.log('❌ Validation failed: description issue. Value:', description, 'Type:', typeof description);
    return res.status(400).json({
      error: { message: 'Description is required and must be a non-empty string', field: 'description' }
    });
  }
  
  // Validate amount
  if (!amount || typeof amount !== 'number' || amount <= 0) {
    console.log('❌ Validation failed: amount issue. Value:', amount, 'Type:', typeof amount);
    return res.status(400).json({
      error: { message: 'Amount must be a positive number', field: 'amount' }
    });
  }
  
  // Validate splitType
  const validSplitTypes = ['equal', 'unequal', 'multi-payer'];
  if (!splitType || !validSplitTypes.includes(splitType)) {
    console.log('❌ Validation failed: splitType issue. Value:', splitType);
    return res.status(400).json({
      error: { message: 'Split type must be either "equal", "unequal", or "multi-payer"', field: 'splitType' }
    });
  }
  
  // Validate splitBetween
  if (!splitBetween || !Array.isArray(splitBetween) || splitBetween.length === 0) {
    console.log('❌ Validation failed: splitBetween issue. Value:', splitBetween);
    return res.status(400).json({
      error: { message: 'Split between must be an array with at least one member', field: 'splitBetween' }
    });
  }
  
  // For single payer expenses, paidBy is optional but if provided must be valid
  if (splitType !== 'multi-payer' && paidBy && (typeof paidBy !== 'string' || paidBy.trim() === '')) {
    console.log('❌ Validation failed: paidBy issue. Value:', paidBy);
    return res.status(400).json({
      error: { message: 'paidBy must be a valid member ID', field: 'paidBy' }
    });
  }
  
  console.log('✅ Validation passed, proceeding...');
  next();
};

/**
 * Validate UUID parameters
 */
function validateUUID(paramName) {
  return (req, res, next) => {
    const uuid = req.params[paramName];
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    if (!uuid || !uuidRegex.test(uuid)) {
      return res.status(400).json({
        error: {
          message: `Invalid ${paramName} format`,
          field: paramName
        }
      });
    }
    
    next();
  };
}

module.exports = {
  validateGroup,
  validateMember,
  validateExpense,
  validateUUID
};