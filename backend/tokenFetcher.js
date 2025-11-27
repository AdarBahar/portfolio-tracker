#!/usr/bin/env node
/**
 * Token Fetcher for Specific Email Addresses
 * 
 * This module attempts to fetch Google ID tokens for specific email addresses
 * by using Puppeteer to automate the login process.
 * 
 * Usage:
 *   const { fetchTokenForEmail } = require('./tokenFetcher');
 *   const token = await fetchTokenForEmail('user@example.com', 'password');
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const TOKEN_CACHE_FILE = path.join(__dirname, '.token-cache.json');

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
 * Fetch token for a specific email address using Puppeteer
 * @param {string} email - Email address to sign in with
 * @param {string} password - Password for the email
 * @returns {Promise<string|null>} - Valid token or null
 */
async function fetchTokenForEmail(email, password) {
  let browser;
  try {
    // Check cache first
    const cache = loadTokenCache();
    const cacheKey = `token_${email}`;
    const cachedToken = cache[cacheKey];
    
    if (cachedToken && !isTokenExpired(cachedToken)) {
      console.log(`✓ Using cached token for ${email}`);
      return cachedToken;
    }

    console.log(`Fetching token for ${email}...`);
    
    // Launch browser
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    
    // Navigate to login page
    await page.goto('https://www.bahar.co.il/fantasybroker/login.html', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // Wait for Google sign-in button and click it
    await page.waitForSelector('button[data-testid="google-signin-button"], [role="button"]:has-text("Sign in with Google")', {
      timeout: 10000
    }).catch(() => null);

    // Try to find and click Google sign-in button
    const googleButton = await page.$('button[data-testid="google-signin-button"]') ||
                         await page.$('[role="button"]');
    
    if (googleButton) {
      await googleButton.click();
    }

    // Wait for Google login popup/redirect
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }).catch(() => null);

    // Fill in email
    await page.type('input[type="email"]', email, { delay: 100 });
    await page.click('#identifierNext');
    
    // Wait for password field
    await page.waitForSelector('input[type="password"]', { timeout: 10000 });
    
    // Fill in password
    await page.type('input[type="password"]', password, { delay: 100 });
    await page.click('#passwordNext');

    // Wait for redirect back to app
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }).catch(() => null);

    // Extract token from localStorage
    const token = await page.evaluate(() => {
      return localStorage.getItem('authToken');
    });

    if (token && !isTokenExpired(token)) {
      // Save to cache
      cache[cacheKey] = token;
      saveTokenCache(cache);
      console.log(`✓ Successfully fetched token for ${email}`);
      return token;
    }

    return null;
  } catch (err) {
    console.error(`Failed to fetch token for ${email}:`, err.message);
    return null;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

module.exports = {
  fetchTokenForEmail,
  isTokenExpired,
  decodeJWT,
};

