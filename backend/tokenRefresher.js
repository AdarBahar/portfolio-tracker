#!/usr/bin/env node
/**
 * Token Refresher for API Tests
 * 
 * This module provides automatic token refresh capabilities for the smoke test suite.
 * Since Google ID tokens expire after 1 hour and cannot be refreshed without user interaction,
 * this provides a mechanism to:
 * 1. Detect expired tokens
 * 2. Prompt user to get fresh tokens
 * 3. Optionally use a token cache file
 * 
 * Usage:
 *   const { getValidToken } = require('./tokenRefresher');
 *   const token = await getValidToken('TEST_GOOGLE_CREDENTIAL');
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const TOKEN_CACHE_FILE = path.join(__dirname, '.token-cache.json');

/**
 * Decode JWT token payload
 */
function decodeJWT(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = Buffer.from(parts[1], 'base64').toString();
    return JSON.parse(payload);
  } catch (err) {
    return null;
  }
}

/**
 * Check if token is expired
 */
function isTokenExpired(token) {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) return true;
  
  const now = Math.floor(Date.now() / 1000);
  const timeLeft = payload.exp - now;
  
  // Consider token expired if less than 5 minutes left
  return timeLeft < 300;
}

/**
 * Load token cache from file
 */
function loadTokenCache() {
  try {
    if (fs.existsSync(TOKEN_CACHE_FILE)) {
      const data = fs.readFileSync(TOKEN_CACHE_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    // Ignore errors, return empty cache
  }
  return {};
}

/**
 * Save token cache to file
 */
function saveTokenCache(cache) {
  try {
    fs.writeFileSync(TOKEN_CACHE_FILE, JSON.stringify(cache, null, 2));
  } catch (err) {
    console.error('Failed to save token cache:', err.message);
  }
}

/**
 * Prompt user for a fresh token
 */
function promptForToken(tokenName) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    console.log(`\n⚠️  ${tokenName} is expired or missing!`);
    console.log('\nTo get a fresh token:');
    console.log('1. Run: node backend/getTokenFromBrowser.js');
    console.log('2. Or visit: https://www.bahar.co.il/fantasybroker/login.html');
    console.log('3. Sign in and copy the token from localStorage\n');
    
    rl.question('Paste the fresh token here (or press Enter to skip): ', (token) => {
      rl.close();
      resolve(token.trim() || null);
    });
  });
}

/**
 * Get a valid token, refreshing if necessary
 * @param {string} tokenName - Environment variable name (e.g., 'TEST_GOOGLE_CREDENTIAL')
 * @param {boolean} interactive - Whether to prompt user for fresh token
 * @returns {Promise<string|null>} - Valid token or null
 */
async function getValidToken(tokenName, interactive = false) {
  // Try environment variable first
  let token = process.env[tokenName];
  
  // Try cache if env var is missing or expired
  if (!token || isTokenExpired(token)) {
    const cache = loadTokenCache();
    const cachedToken = cache[tokenName];
    
    if (cachedToken && !isTokenExpired(cachedToken)) {
      return cachedToken;
    }
    
    // If interactive mode, prompt for fresh token
    if (interactive) {
      const freshToken = await promptForToken(tokenName);
      if (freshToken && !isTokenExpired(freshToken)) {
        // Save to cache
        cache[tokenName] = freshToken;
        saveTokenCache(cache);
        return freshToken;
      }
    }
    
    return null;
  }
  
  return token;
}

/**
 * Clear token cache
 */
function clearTokenCache() {
  try {
    if (fs.existsSync(TOKEN_CACHE_FILE)) {
      fs.unlinkSync(TOKEN_CACHE_FILE);
      console.log('Token cache cleared');
    }
  } catch (err) {
    console.error('Failed to clear token cache:', err.message);
  }
}

module.exports = {
  getValidToken,
  isTokenExpired,
  decodeJWT,
  clearTokenCache,
};

