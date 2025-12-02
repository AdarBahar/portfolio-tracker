/**
 * Trade Room Validation Utilities
 * Comprehensive validation for Trade Room operations
 */

/**
 * Validate room creation parameters
 * @param {object} params - Room parameters
 * @returns {{valid: boolean, errors: array}}
 */
function validateRoomCreation(params) {
  const errors = [];
  
  if (!params.name || typeof params.name !== 'string' || params.name.trim().length === 0) {
    errors.push('Room name is required and must be a non-empty string');
  }
  
  if (params.name && params.name.length > 255) {
    errors.push('Room name must be 255 characters or less');
  }
  
  if (!Number.isInteger(params.durationSec) || params.durationSec < 60) {
    errors.push('Duration must be an integer >= 60 seconds');
  }
  
  if (params.durationSec > 86400) {
    errors.push('Duration must be <= 86400 seconds (24 hours)');
  }
  
  if (!Number.isFinite(params.startingCash) || params.startingCash <= 0) {
    errors.push('Starting cash must be a positive number');
  }
  
  if (params.startingCash > 1000000) {
    errors.push('Starting cash must be <= 1,000,000');
  }
  
  if (!Number.isInteger(params.maxPlayers) || params.maxPlayers < 2 || params.maxPlayers > 100) {
    errors.push('Max players must be an integer between 2 and 100');
  }
  
  if (params.startTime) {
    const startTime = new Date(params.startTime);
    if (isNaN(startTime.getTime())) {
      errors.push('Start time must be a valid ISO 8601 date');
    } else if (startTime < new Date()) {
      errors.push('Start time must be in the future');
    }
  }
  
  if (params.description && params.description.length > 1000) {
    errors.push('Description must be 1000 characters or less');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate order parameters
 * @param {object} params - Order parameters
 * @returns {{valid: boolean, errors: array}}
 */
function validateOrderParams(params) {
  const errors = [];
  
  if (!params.symbol || typeof params.symbol !== 'string' || params.symbol.trim().length === 0) {
    errors.push('Symbol is required and must be a non-empty string');
  }
  
  if (params.symbol && params.symbol.length > 10) {
    errors.push('Symbol must be 10 characters or less');
  }
  
  if (!['buy', 'sell'].includes(params.side)) {
    errors.push('Side must be "buy" or "sell"');
  }
  
  if (!['market', 'limit'].includes(params.type)) {
    errors.push('Type must be "market" or "limit"');
  }
  
  if (!Number.isFinite(params.qty) || params.qty <= 0) {
    errors.push('Quantity must be a positive number');
  }
  
  if (params.qty > 1000000) {
    errors.push('Quantity must be <= 1,000,000');
  }
  
  if (params.type === 'limit') {
    if (!Number.isFinite(params.limitPrice) || params.limitPrice <= 0) {
      errors.push('Limit price is required for limit orders and must be positive');
    }
    
    if (params.limitPrice > 1000000) {
      errors.push('Limit price must be <= 1,000,000');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate room update parameters
 * @param {object} params - Update parameters
 * @returns {{valid: boolean, errors: array}}
 */
function validateRoomUpdate(params) {
  const errors = [];
  
  if (params.name !== undefined) {
    if (typeof params.name !== 'string' || params.name.trim().length === 0) {
      errors.push('Room name must be a non-empty string');
    }
    
    if (params.name.length > 255) {
      errors.push('Room name must be 255 characters or less');
    }
  }
  
  if (params.state !== undefined) {
    const validStates = ['draft', 'scheduled', 'active', 'completed', 'cancelled'];
    if (!validStates.includes(params.state)) {
      errors.push(`State must be one of: ${validStates.join(', ')}`);
    }
  }
  
  if (params.maxPlayers !== undefined) {
    if (!Number.isInteger(params.maxPlayers) || params.maxPlayers < 2 || params.maxPlayers > 100) {
      errors.push('Max players must be an integer between 2 and 100');
    }
  }
  
  if (params.startingCash !== undefined) {
    if (!Number.isFinite(params.startingCash) || params.startingCash <= 0) {
      errors.push('Starting cash must be a positive number');
    }
    
    if (params.startingCash > 1000000) {
      errors.push('Starting cash must be <= 1,000,000');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

module.exports = {
  validateRoomCreation,
  validateOrderParams,
  validateRoomUpdate,
};

