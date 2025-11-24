/**
 * API Smoke Test Runner for Portfolio Tracker backend.
 *
 * Usage examples:
 *   node backend/apiSmokeTest.js --base-url=http://localhost:4000
 *   node backend/apiSmokeTest.js --base-url=https://www.bahar.co.il/fantasybroker-api
 *   node backend/apiSmokeTest.js --base-url=http://localhost:4000 --google-credential=JWT
 *
 * Use --list to see all registered tests.
 *
 * Tests are documented in backend/API_TESTS.md.
 */

const http = require('http');
const https = require('https');
const { URL } = require('url');
const { getValidToken, isTokenExpired } = require('./tokenRefresher');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

/**
 * Decode JWT token payload without verification
 * @param {string} token - JWT token
 * @returns {object|null} - Decoded payload or null if invalid
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
 * Check if JWT token is expired
 * @param {string} token - JWT token
 * @returns {object} - { expired: boolean, expiresAt: Date|null, timeLeft: number|null }
 */
function checkTokenExpiry(token) {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) {
    return { expired: true, expiresAt: null, timeLeft: null };
  }

  const now = Math.floor(Date.now() / 1000);
  const timeLeft = payload.exp - now;
  const expiresAt = new Date(payload.exp * 1000);

  return {
    expired: timeLeft <= 0,
    expiresAt,
    timeLeft,
    email: payload.email || payload.sub,
  };
}

/**
 * Format time duration in human-readable format
 * @param {number} seconds - Duration in seconds
 * @returns {string} - Formatted duration
 */
function formatDuration(seconds) {
  if (seconds < 0) return 'expired';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${secs}s`;
  return `${secs}s`;
}

function httpRequest(method, urlString, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlString);
    const client = url.protocol === 'https:' ? https : http;
    const reqOptions = {
      method,
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      headers: options.headers || {},
      timeout: options.timeout || 8000,
    };

    const req = client.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        let json = null;
        const contentType = res.headers['content-type'] || '';
        if (contentType.includes('application/json')) {
          try {
            json = JSON.parse(data || '{}');
          } catch (e) {
            // ignore JSON parse errors
          }
        }
        resolve({ status: res.statusCode, headers: res.headers, rawBody: data, json });
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(options.body);
    }

    req.end();
  });
}

function getArg(name) {
  const index = process.argv.indexOf(name);
  if (index !== -1 && index + 1 < process.argv.length) {
    return process.argv[index + 1];
  }
  return null;
}

const baseUrl = getArg('--base-url') || process.env.API_BASE_URL || 'http://localhost:4000';
let googleCredential = getArg('--google-credential') || process.env.TEST_GOOGLE_CREDENTIAL || null;
let secondGoogleCredential =
  getArg('--google-credential-2') || process.env.TEST_GOOGLE_CREDENTIAL_2 || null;
const listOnly = process.argv.includes('--list') || process.argv.includes('-l');
const interactiveRefresh = process.argv.includes('--interactive') || process.argv.includes('-i');

const tests = [];

function addTest(id, endpoint, description, run, { optional = false } = {}) {
  tests.push({ id, endpoint, description, run, optional });
}

addTest(
  'health-basic',
  'GET /api/health',
  'API and DB health: expects 200 and { status: "ok", db: "ok" }',
  async (ctx) => {
    const res = await httpRequest('GET', `${ctx.baseUrl}/api/health`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const body = res.json || {};
    if (body.status !== 'ok') throw new Error(`Expected status "ok", got ${body.status}`);
    if (body.db !== 'ok') throw new Error(`Expected db "ok", got ${body.db}`);
  }
);

addTest(
  'openapi-available',
  'GET /api/openapi.json',
  'OpenAPI spec is served and documents core endpoints',
  async (ctx) => {
    const res = await httpRequest('GET', `${ctx.baseUrl}/api/openapi.json`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const body = res.json || {};
    if (!body.paths) {
      throw new Error('OpenAPI spec missing paths');
    }

    const requiredPaths = [
      '/api/health',
      '/api/auth/google',
      '/api/holdings',
      '/api/holdings/{id}',
      '/api/dividends',
      '/api/dividends/{id}',
      '/api/transactions',
      '/api/transactions/{id}',
      '/api/portfolio/all',
    ];

    const missing = requiredPaths.filter((p) => !body.paths[p]);
    if (missing.length > 0) {
      throw new Error(`OpenAPI paths missing expected entries: ${missing.join(', ')}`);
    }
  }
);

addTest(
  'auth-google-missing-credential',
  'POST /api/auth/google',
  'Missing credential should return 400 with error "Missing Google credential"',
  async (ctx) => {
    const res = await httpRequest('POST', `${ctx.baseUrl}/api/auth/google`, {
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
    const body = res.json || {};
    if (!body.error || !body.error.includes('Missing Google credential')) {
      throw new Error(`Unexpected error message: ${body.error}`);
    }
  }
);

addTest(
  'auth-google-invalid-credential',
  'POST /api/auth/google',
  'Invalid credential should return 401 with error "Invalid or expired Google token"',
  async (ctx) => {
    const res = await httpRequest('POST', `${ctx.baseUrl}/api/auth/google`, {
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential: 'not-a-real-google-token' }),
    });
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
    const body = res.json || {};
    if (!body.error || !body.error.includes('Invalid or expired Google token')) {
      throw new Error(`Unexpected error message: ${body.error}`);
    }
  }
);

addTest(
  'auth-google-valid-credential',
  'POST /api/auth/google',
  'Valid Google ID token should return 200 with user and backend JWT token',
  async (ctx) => {
    const res = await httpRequest('POST', `${ctx.baseUrl}/api/auth/google`, {
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential: ctx.googleCredential }),
    });

    if (res.status !== 200) {
      const tokenInfo = checkTokenExpiry(ctx.googleCredential);
      let errorMsg = `Expected 200, got ${res.status}`;

      if (res.status === 401 && tokenInfo.expired) {
        errorMsg += ` (Token expired at ${tokenInfo.expiresAt?.toISOString()}. Run: node backend/getTokenFromBrowser.js)`;
      } else if (res.status === 401) {
        const body = res.json || {};
        errorMsg += ` (${body.error || 'Invalid token'})`;
      }

      throw new Error(errorMsg);
    }

    const body = res.json || {};
    if (!body.user || !body.token) throw new Error('Response missing user or token');
    if (!body.user.email || typeof body.user.id === 'undefined') {
      throw new Error('User object missing email or id');
    }
  },
  { optional: true }
);

addTest(
  'market-data-single-symbol',
  'GET /api/market-data/:symbol',
  'Fetch real-time market data for a single stock symbol (AAPL)',
  async (ctx) => {
    const res = await httpRequest('GET', `${ctx.baseUrl}/api/market-data/AAPL`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const body = res.json || {};
    if (!body.symbol || body.symbol !== 'AAPL') {
      throw new Error(`Expected symbol "AAPL", got ${body.symbol}`);
    }
    if (typeof body.currentPrice !== 'number' || body.currentPrice <= 0) {
      throw new Error(`Invalid currentPrice: ${body.currentPrice}`);
    }
    if (!body.companyName) {
      throw new Error('Missing companyName');
    }
    if (typeof body.changePercent !== 'number') {
      throw new Error(`Invalid changePercent: ${body.changePercent}`);
    }
    if (!body.lastUpdated) {
      throw new Error('Missing lastUpdated');
    }
  }
);

addTest(
  'market-data-multiple-symbols',
  'GET /api/market-data?symbols=AAPL,GOOGL,TSLA',
  'Fetch real-time market data for multiple stock symbols',
  async (ctx) => {
    const res = await httpRequest('GET', `${ctx.baseUrl}/api/market-data?symbols=AAPL,GOOGL,TSLA`);
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const body = res.json || {};
    if (!body.data || !Array.isArray(body.data)) {
      throw new Error('Expected data array in response');
    }
    if (body.data.length !== 3) {
      throw new Error(`Expected 3 symbols, got ${body.data.length}`);
    }

    const symbols = body.data.map(d => d.symbol).sort();
    const expected = ['AAPL', 'GOOGL', 'TSLA'];
    if (JSON.stringify(symbols) !== JSON.stringify(expected)) {
      throw new Error(`Expected symbols ${expected.join(',')}, got ${symbols.join(',')}`);
    }

    // Verify each symbol has required fields
    for (const item of body.data) {
      if (typeof item.currentPrice !== 'number' || item.currentPrice <= 0) {
        throw new Error(`Invalid currentPrice for ${item.symbol}: ${item.currentPrice}`);
      }
      if (!item.companyName) {
        throw new Error(`Missing companyName for ${item.symbol}`);
      }
    }
  }
);

addTest(
  'market-data-invalid-symbol',
  'GET /api/market-data/:symbol (invalid)',
  'Invalid stock symbol should return 500 or fallback to stub data',
  async (ctx) => {
    const res = await httpRequest('GET', `${ctx.baseUrl}/api/market-data/INVALID_SYMBOL_XYZ`);
    // Either returns 500 error or fallback stub data with 200
    if (res.status !== 200 && res.status !== 500) {
      throw new Error(`Expected 200 or 500, got ${res.status}`);
    }

    if (res.status === 200) {
      const body = res.json || {};
      if (!body.symbol || body.symbol !== 'INVALID_SYMBOL_XYZ') {
        throw new Error('Fallback should return requested symbol');
      }
      // Stub data should still have valid structure
      if (typeof body.currentPrice !== 'number') {
        throw new Error('Fallback should return valid price structure');
      }
    }
  }
);

addTest(
  'portfolio-all-authorized',
  'GET /api/portfolio/all (authorized)',
  'Authenticated user with a valid backend JWT can fetch portfolio with holdings, dividends, and transactions arrays',
  async (ctx) => {
    if (!ctx.googleCredential) {
      throw new Error('No Google credential provided for portfolio-all-authorized test');
    }

    const authRes = await httpRequest('POST', `${ctx.baseUrl}/api/auth/google`, {
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential: ctx.googleCredential }),
    });
    if (authRes.status !== 200) {
      throw new Error(`Auth step failed, expected 200, got ${authRes.status}`);
    }
    const authBody = authRes.json || {};
    if (!authBody.token) {
      throw new Error('Auth response missing backend JWT token');
    }

    const res = await httpRequest('GET', `${ctx.baseUrl}/api/portfolio/all`, {
      headers: { Authorization: `Bearer ${authBody.token}` },
    });

    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const body = res.json || {};
    if (!Array.isArray(body.holdings)) {
      throw new Error('Portfolio response missing holdings array');
    }
    if (!Array.isArray(body.dividends)) {
      throw new Error('Portfolio response missing dividends array');
    }
    if (!Array.isArray(body.transactions)) {
      throw new Error('Portfolio response missing transactions array');
    }
  },
  { optional: true }
);

addTest(
  'holdings-unauthorized',
  'GET /api/holdings',
  'GET /api/holdings without Authorization header should return 401',
  async (ctx) => {
    const res = await httpRequest('GET', `${ctx.baseUrl}/api/holdings`);
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
  }
);

addTest(
  'portfolio-all-unauthorized',
  'GET /api/portfolio/all',
  'GET /api/portfolio/all without Authorization header should return 401',
  async (ctx) => {
    const res = await httpRequest('GET', `${ctx.baseUrl}/api/portfolio/all`);
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
  }
);

addTest(
  'dividends-unauthorized',
  'GET /api/dividends',
  'GET /api/dividends without Authorization header should return 401',
  async (ctx) => {
    const res = await httpRequest('GET', `${ctx.baseUrl}/api/dividends`);
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
  }
);

addTest(
  'transactions-unauthorized',
  'GET /api/transactions',
  'GET /api/transactions without Authorization header should return 401',
  async (ctx) => {
    const res = await httpRequest('GET', `${ctx.baseUrl}/api/transactions`);
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
  }
);

addTest(
  'dividends-authorized-crud',
  'CRUD /api/dividends (authorized)',
  'Given a valid Google credential, create, update, and delete a dividend via the API',
  async (ctx) => {
    if (!ctx.googleCredential) {
      throw new Error('No Google credential provided for dividends-authorized-crud test');
    }

    const authRes = await httpRequest('POST', `${ctx.baseUrl}/api/auth/google`, {
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential: ctx.googleCredential }),
    });
    if (authRes.status !== 200) {
      throw new Error(`Auth step failed, expected 200, got ${authRes.status}`);
    }
    const authBody = authRes.json || {};
    if (!authBody.token) {
      throw new Error('Auth response missing backend JWT token');
    }

    const authHeader = { Authorization: `Bearer ${authBody.token}` };

    const createRes = await httpRequest('POST', `${ctx.baseUrl}/api/dividends`, {
      headers: { 'Content-Type': 'application/json', ...authHeader },
      body: JSON.stringify({
        ticker: 'TEST',
        amount: 1.23,
        shares: 10,
        date: '2024-01-01',
      }),
    });
    if (createRes.status !== 201) {
      throw new Error(`Expected 201 from create dividend, got ${createRes.status}`);
    }
    const created = (createRes.json || {}).dividend;
    if (!created || !created.id) {
      throw new Error('Create dividend response missing dividend.id');
    }

    const updateRes = await httpRequest('PUT', `${ctx.baseUrl}/api/dividends/${created.id}`, {
      headers: { 'Content-Type': 'application/json', ...authHeader },
      body: JSON.stringify({
        ticker: 'TEST',
        amount: 2.34,
        shares: 20,
        date: '2024-02-02',
      }),
    });
    if (updateRes.status !== 200) {
      throw new Error(`Expected 200 from update dividend, got ${updateRes.status}`);
    }

    const deleteRes = await httpRequest('DELETE', `${ctx.baseUrl}/api/dividends/${created.id}`, {
      headers: authHeader,
    });
    if (deleteRes.status !== 204) {
      throw new Error(`Expected 204 from delete dividend, got ${deleteRes.status}`);
    }
  },
  { optional: true }
);

addTest(
  'transactions-authorized-crud',
  'CRUD /api/transactions (authorized)',
  'Given a valid Google credential, create, update, and delete a transaction via the API',
  async (ctx) => {
    if (!ctx.googleCredential) {
      throw new Error('No Google credential provided for transactions-authorized-crud test');
    }

    const authRes = await httpRequest('POST', `${ctx.baseUrl}/api/auth/google`, {
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential: ctx.googleCredential }),
    });
    if (authRes.status !== 200) {
      throw new Error(`Auth step failed, expected 200, got ${authRes.status}`);
    }
    const authBody = authRes.json || {};
    if (!authBody.token) {
      throw new Error('Auth response missing backend JWT token');
    }

    const authHeader = { Authorization: `Bearer ${authBody.token}` };

    const createRes = await httpRequest('POST', `${ctx.baseUrl}/api/transactions`, {
      headers: { 'Content-Type': 'application/json', ...authHeader },
      body: JSON.stringify({
        type: 'buy',
        ticker: 'TEST',
        shares: 5,
        price: 10.5,
        fees: 0.25,
        date: '2024-01-01',
      }),
    });
    if (createRes.status !== 201) {
      throw new Error(`Expected 201 from create transaction, got ${createRes.status}`);
    }
    const created = (createRes.json || {}).transaction;
    if (!created || !created.id) {
      throw new Error('Create transaction response missing transaction.id');
    }

    const updateRes = await httpRequest('PUT', `${ctx.baseUrl}/api/transactions/${created.id}`, {
      headers: { 'Content-Type': 'application/json', ...authHeader },
      body: JSON.stringify({
        type: 'sell',
        ticker: 'TEST',
        shares: 3,
        price: 11.0,
        fees: 0.1,
        date: '2024-02-02',
      }),
    });
    if (updateRes.status !== 200) {
      throw new Error(`Expected 200 from update transaction, got ${updateRes.status}`);
    }

    const deleteRes = await httpRequest('DELETE', `${ctx.baseUrl}/api/transactions/${created.id}`, {
      headers: authHeader,
    });
    if (deleteRes.status !== 204) {
      throw new Error(`Expected 204 from delete transaction, got ${deleteRes.status}`);
    }
  },
  { optional: true }
);
addTest(
  'bull-pens-unauthorized',
  'GET /api/bull-pens',
  'GET /api/bull-pens without Authorization header should return 401',
  async (ctx) => {
    const res = await httpRequest('GET', `${ctx.baseUrl}/api/bull-pens`);
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
  }
);

addTest(
  'my-bull-pens-unauthorized',
  'GET /api/my/bull-pens',
  'GET /api/my/bull-pens without Authorization header should return 401',
  async (ctx) => {
    const res = await httpRequest('GET', `${ctx.baseUrl}/api/my/bull-pens`);
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
  }
);

addTest(
  'bull-pens-authorized-basic-flow',
  'CRUD /api/bull-pens + membership (authorized)',
  'Given a valid Google credential, create a bull pen and verify membership and basic reads',
  async (ctx) => {
    if (!ctx.googleCredential) {
      throw new Error('No Google credential provided for bull-pens-authorized-basic-flow test');
    }

    const authRes = await httpRequest('POST', `${ctx.baseUrl}/api/auth/google`, {
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential: ctx.googleCredential }),
    });
    if (authRes.status !== 200) {
      throw new Error(`Auth step failed, expected 200, got ${authRes.status}`);
    }
    const authBody = authRes.json || {};
    if (!authBody.token) {
      throw new Error('Auth response missing backend JWT token');
    }

    const authHeader = { Authorization: `Bearer ${authBody.token}` };

    const createRes = await httpRequest('POST', `${ctx.baseUrl}/api/bull-pens`, {
      headers: { 'Content-Type': 'application/json', ...authHeader },
      body: JSON.stringify({
        name: 'Smoke Test Bull Pen',
        description: 'Smoke test room',
        durationSec: 3600,
        maxPlayers: 10,
        startingCash: 10000,
        allowFractional: true,
        approvalRequired: false,
      }),
    });

    if (createRes.status !== 201) {
      throw new Error(`Expected 201 from create bull pen, got ${createRes.status}`);
    }
    const created = (createRes.json || {}).bullPen;
    if (!created || !created.id) {
      throw new Error('Create bull pen response missing bullPen.id');
    }
    if (typeof created.hostUserId === 'undefined') {
      throw new Error('Create bull pen response missing hostUserId');
    }

    const bullPenId = created.id;

    const getRes = await httpRequest('GET', `${ctx.baseUrl}/api/bull-pens/${bullPenId}`, {
      headers: authHeader,
    });
    if (getRes.status !== 200) {
      throw new Error(`Expected 200 from get bull pen, got ${getRes.status}`);
    }
    const got = (getRes.json || {}).bullPen;
    if (!got || got.id !== bullPenId) {
      throw new Error('Get bull pen returned wrong id');
    }

    const patchRes = await httpRequest('PATCH', `${ctx.baseUrl}/api/bull-pens/${bullPenId}`, {
      headers: { 'Content-Type': 'application/json', ...authHeader },
      body: JSON.stringify({ name: 'Updated Smoke Test Bull Pen' }),
    });
    if (patchRes.status !== 200) {
      throw new Error(`Expected 200 from update bull pen, got ${patchRes.status}`);
    }
    const patched = (patchRes.json || {}).bullPen;
    if (!patched || patched.name !== 'Updated Smoke Test Bull Pen') {
      throw new Error('Updated bull pen has unexpected name');
    }

    const listRes = await httpRequest('GET', `${ctx.baseUrl}/api/bull-pens?hostOnly=true`, {
      headers: authHeader,
    });
    if (listRes.status !== 200) {
      throw new Error(`Expected 200 from list bull pens, got ${listRes.status}`);
    }
    const listBody = listRes.json || {};
    if (!Array.isArray(listBody.bullPens)) {
      throw new Error('List bull pens response missing bullPens array');
    }
    const foundInList = listBody.bullPens.some((bp) => bp.id === bullPenId);
    if (!foundInList) {
      throw new Error('Created bull pen not found in /api/bull-pens?hostOnly=true');
    }

    const myRes = await httpRequest('GET', `${ctx.baseUrl}/api/my/bull-pens`, {
      headers: authHeader,
    });
    if (myRes.status !== 200) {
      throw new Error(`Expected 200 from /api/my/bull-pens, got ${myRes.status}`);
    }
    const myBody = myRes.json || {};
    if (!Array.isArray(myBody.bullPens)) {
      throw new Error('My bull pens response missing bullPens array');
    }
    const foundInMy = myBody.bullPens.some((bp) => bp.id === bullPenId);
    if (!foundInMy) {
      throw new Error('Created bull pen not found in /api/my/bull-pens');
    }

    const membersRes = await httpRequest('GET', `${ctx.baseUrl}/api/bull-pens/${bullPenId}/members`, {
      headers: authHeader,
    });
    if (membersRes.status !== 200) {
      throw new Error(`Expected 200 from list bull pen members, got ${membersRes.status}`);
    }
    const membersBody = membersRes.json || {};
    if (!Array.isArray(membersBody.members)) {
      throw new Error('Members response missing members array');
    }
    const hostMembership = membersBody.members.find((m) => m.role === 'host');
    if (!hostMembership) {
      throw new Error('No host membership found for bull pen');
    }
    if (hostMembership.bullPenId !== bullPenId) {
      throw new Error('Host membership bullPenId does not match bullPenId');
    }

    const leaveRes = await httpRequest('POST', `${ctx.baseUrl}/api/bull-pens/${bullPenId}/leave`, {
      headers: authHeader,
    });
    if (leaveRes.status !== 400) {
      throw new Error(`Expected 400 from host leave bull pen, got ${leaveRes.status}`);
    }
  },
  { optional: true }
);

addTest(
  'bull-pens-membership-approval-flow',
  'POST /api/bull-pens/{id}/join + approve + leave (authorized, two users)',
  'Host creates approval-required bull pen, second user joins, host approves, second user leaves',
  async (ctx) => {
    if (!ctx.googleCredential || !ctx.secondGoogleCredential) {
      throw new Error(
        'Requires two Google credentials (primary and secondary) for bull-pens-membership-approval-flow test'
      );
    }

    const hostAuthRes = await httpRequest('POST', `${ctx.baseUrl}/api/auth/google`, {
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential: ctx.googleCredential }),
    });
    if (hostAuthRes.status !== 200) {
      throw new Error(`Host auth step failed, expected 200, got ${hostAuthRes.status}`);
    }
    const hostAuthBody = hostAuthRes.json || {};
    if (!hostAuthBody.token || !hostAuthBody.user || typeof hostAuthBody.user.id === 'undefined') {
      throw new Error('Host auth response missing token or user.id');
    }

    const hostHeader = { Authorization: `Bearer ${hostAuthBody.token}` };
    const hostUserId = hostAuthBody.user.id;

    const playerAuthRes = await httpRequest('POST', `${ctx.baseUrl}/api/auth/google`, {
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential: ctx.secondGoogleCredential }),
    });
    if (playerAuthRes.status !== 200) {
      throw new Error(`Player auth step failed, expected 200, got ${playerAuthRes.status}`);
    }
    const playerAuthBody = playerAuthRes.json || {};
    if (!playerAuthBody.token || !playerAuthBody.user || typeof playerAuthBody.user.id === 'undefined') {
      throw new Error('Player auth response missing token or user.id');
    }

    const playerHeader = { Authorization: `Bearer ${playerAuthBody.token}` };
    const playerUserId = playerAuthBody.user.id;

    if (playerUserId === hostUserId) {
      throw new Error('Host and player must be different users for membership approval flow');
    }

    const createRes = await httpRequest('POST', `${ctx.baseUrl}/api/bull-pens`, {
      headers: { 'Content-Type': 'application/json', ...hostHeader },
      body: JSON.stringify({
        name: 'Membership Flow Bull Pen',
        description: 'Membership approval flow room',
        durationSec: 1800,
        maxPlayers: 5,
        startingCash: 5000,
        allowFractional: false,
        approvalRequired: true,
      }),
    });

    if (createRes.status !== 201) {
      throw new Error(`Expected 201 from create bull pen, got ${createRes.status}`);
    }
    const created = (createRes.json || {}).bullPen;
    if (!created || !created.id) {
      throw new Error('Create bull pen response missing bullPen.id');
    }

    const bullPenId = created.id;

    const joinRes = await httpRequest('POST', `${ctx.baseUrl}/api/bull-pens/${bullPenId}/join`, {
      headers: playerHeader,
    });
    if (joinRes.status !== 201) {
      throw new Error(`Expected 201 from join bull pen, got ${joinRes.status}`);
    }
    const joinBody = joinRes.json || {};
    const membership = joinBody.membership;
    if (!membership || !membership.id) {
      throw new Error('Join bull pen response missing membership.id');
    }
    if (membership.status !== 'pending') {
      throw new Error(`Expected membership.status "pending", got "${membership.status}"`);
    }
    if (membership.userId !== playerUserId) {
      throw new Error('Membership userId does not match player user id');
    }
    if (membership.bullPenId !== bullPenId) {
      throw new Error('Membership bullPenId does not match bullPenId');
    }

    const membersRes = await httpRequest('GET', `${ctx.baseUrl}/api/bull-pens/${bullPenId}/members`, {
      headers: hostHeader,
    });
    if (membersRes.status !== 200) {
      throw new Error(`Expected 200 from list bull pen members, got ${membersRes.status}`);
    }
    const membersBody = membersRes.json || {};
    if (!Array.isArray(membersBody.members)) {
      throw new Error('Members response missing members array');
    }
    const pendingMember = membersBody.members.find((m) => m.id === membership.id);
    if (!pendingMember) {
      throw new Error('Pending membership not found in members list');
    }
    if (pendingMember.status !== 'pending') {
      throw new Error(`Expected pending member status "pending", got "${pendingMember.status}"`);
    }

    const approveRes = await httpRequest(
      'POST',
      `${ctx.baseUrl}/api/bull-pens/${bullPenId}/members/${membership.id}/approve`,
      { headers: hostHeader }
    );
    if (approveRes.status !== 200) {
      throw new Error(`Expected 200 from approve membership, got ${approveRes.status}`);
    }
    const approveBody = approveRes.json || {};
    const approved = approveBody.membership;
    if (!approved || approved.status !== 'active') {
      throw new Error(`Expected approved membership.status "active", got "${approved && approved.status}"`);
    }
    if (approved.userId !== playerUserId || approved.bullPenId !== bullPenId) {
      throw new Error('Approved membership does not match expected user or bull pen');
    }

    const myRes = await httpRequest('GET', `${ctx.baseUrl}/api/my/bull-pens`, {
      headers: playerHeader,
    });
    if (myRes.status !== 200) {
      throw new Error(`Expected 200 from /api/my/bull-pens for player, got ${myRes.status}`);
    }
    const myBody = myRes.json || {};
    if (!Array.isArray(myBody.bullPens)) {
      throw new Error('Player my bull pens response missing bullPens array');
    }
    const foundInMy = myBody.bullPens.some((bp) => bp.id === bullPenId);
    if (!foundInMy) {
      throw new Error('Bull pen not found in player /api/my/bull-pens after approval');
    }

    const leaveRes = await httpRequest('POST', `${ctx.baseUrl}/api/bull-pens/${bullPenId}/leave`, {
      headers: playerHeader,
    });
    if (leaveRes.status !== 200) {
      throw new Error(`Expected 200 from player leave bull pen, got ${leaveRes.status}`);
    }
    const leaveBody = leaveRes.json || {};
    const leftMembership = leaveBody.membership;
    if (!leftMembership || leftMembership.status !== 'left') {
      throw new Error(`Expected left membership.status "left", got "${leftMembership && leftMembership.status}"`);
    }
  },
  { optional: true }
);

addTest(
  'bull-pen-orders-unauthorized',
  'GET /api/bull-pens/{id}/orders',
  'GET /api/bull-pens/{id}/orders without Authorization header should return 401',
  async (ctx) => {
    const res = await httpRequest('GET', `${ctx.baseUrl}/api/bull-pens/1/orders`);
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
  }
);

addTest(
  'bull-pen-positions-unauthorized',
  'GET /api/bull-pens/{id}/positions',
  'GET /api/bull-pens/{id}/positions without Authorization header should return 401',
  async (ctx) => {
    const res = await httpRequest('GET', `${ctx.baseUrl}/api/bull-pens/1/positions`);
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
  }
);

addTest(
  'bull-pen-orders-buy-sell-flow',
  'POST /api/bull-pens/{id}/orders (buy + sell flow)',
  'Create active bull pen, place buy order, verify position, place sell order, verify cash and position updates',
  async (ctx) => {
    if (!ctx.googleCredential) {
      throw new Error('No Google credential provided for bull-pen-orders-buy-sell-flow test');
    }

    const authRes = await httpRequest('POST', `${ctx.baseUrl}/api/auth/google`, {
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential: ctx.googleCredential }),
    });
    if (authRes.status !== 200) {
      throw new Error(`Auth step failed, expected 200, got ${authRes.status}`);
    }
    const authBody = authRes.json || {};
    if (!authBody.token) {
      throw new Error('Auth response missing backend JWT token');
    }

    const authHeader = { Authorization: `Bearer ${authBody.token}` };

    const createRes = await httpRequest('POST', `${ctx.baseUrl}/api/bull-pens`, {
      headers: { 'Content-Type': 'application/json', ...authHeader },
      body: JSON.stringify({
        name: 'Orders Test Bull Pen',
        description: 'Testing order execution',
        durationSec: 3600,
        maxPlayers: 10,
        startingCash: 10000,
        allowFractional: true,
        approvalRequired: false,
      }),
    });

    if (createRes.status !== 201) {
      throw new Error(`Expected 201 from create bull pen, got ${createRes.status}`);
    }
    const created = (createRes.json || {}).bullPen;
    if (!created || !created.id) {
      throw new Error('Create bull pen response missing bullPen.id');
    }

    const bullPenId = created.id;

    // Transition bull pen to active state so we can place orders
    const activateRes = await httpRequest('PATCH', `${ctx.baseUrl}/api/bull-pens/${bullPenId}`, {
      headers: { 'Content-Type': 'application/json', ...authHeader },
      body: JSON.stringify({ state: 'active' }),
    });
    if (activateRes.status !== 200) {
      throw new Error(`Expected 200 from activate bull pen, got ${activateRes.status}`);
    }

    // Place a buy order
    const buyRes = await httpRequest('POST', `${ctx.baseUrl}/api/bull-pens/${bullPenId}/orders`, {
      headers: { 'Content-Type': 'application/json', ...authHeader },
      body: JSON.stringify({
        symbol: 'AAPL',
        side: 'buy',
        type: 'market',
        qty: 10,
      }),
    });

    if (buyRes.status !== 200) {
      throw new Error(`Expected 200 from buy order, got ${buyRes.status}`);
    }
    const buyBody = buyRes.json || {};
    if (buyBody.status !== 'filled') {
      throw new Error(`Expected buy order status "filled", got "${buyBody.status}"`);
    }
    if (!buyBody.orderId || typeof buyBody.fillPrice !== 'number' || buyBody.fillPrice <= 0) {
      throw new Error('Buy order response missing orderId or valid fillPrice');
    }
    if (typeof buyBody.newCash !== 'number' || buyBody.newCash >= 10000) {
      throw new Error('Buy order newCash should be less than starting cash');
    }
    if (!buyBody.newPosition || buyBody.newPosition.qty !== 10 || buyBody.newPosition.symbol !== 'AAPL') {
      throw new Error('Buy order newPosition missing or incorrect');
    }

    const expectedCashAfterBuy = buyBody.newCash;
    const buyPrice = buyBody.fillPrice;

    // Verify position appears in positions list
    const positionsRes = await httpRequest('GET', `${ctx.baseUrl}/api/bull-pens/${bullPenId}/positions?mine=true`, {
      headers: authHeader,
    });
    if (positionsRes.status !== 200) {
      throw new Error(`Expected 200 from list positions, got ${positionsRes.status}`);
    }
    const positionsBody = positionsRes.json || {};
    if (!Array.isArray(positionsBody.positions)) {
      throw new Error('Positions response missing positions array');
    }
    const aaplPosition = positionsBody.positions.find((p) => p.symbol === 'AAPL');
    if (!aaplPosition || Number(aaplPosition.qty) !== 10) {
      throw new Error('AAPL position not found or qty incorrect in positions list');
    }

    // Verify order appears in orders list
    const ordersRes = await httpRequest('GET', `${ctx.baseUrl}/api/bull-pens/${bullPenId}/orders?mine=true`, {
      headers: authHeader,
    });
    if (ordersRes.status !== 200) {
      throw new Error(`Expected 200 from list orders, got ${ordersRes.status}`);
    }
    const ordersBody = ordersRes.json || {};
    if (!Array.isArray(ordersBody.orders)) {
      throw new Error('Orders response missing orders array');
    }
    const buyOrder = ordersBody.orders.find((o) => o.id === buyBody.orderId);
    if (!buyOrder || buyOrder.status !== 'filled' || buyOrder.symbol !== 'AAPL') {
      throw new Error('Buy order not found or incorrect in orders list');
    }

    // Place a sell order for 5 shares
    const sellRes = await httpRequest('POST', `${ctx.baseUrl}/api/bull-pens/${bullPenId}/orders`, {
      headers: { 'Content-Type': 'application/json', ...authHeader },
      body: JSON.stringify({
        symbol: 'AAPL',
        side: 'sell',
        type: 'market',
        qty: 5,
      }),
    });

    if (sellRes.status !== 200) {
      throw new Error(`Expected 200 from sell order, got ${sellRes.status}`);
    }
    const sellBody = sellRes.json || {};
    if (sellBody.status !== 'filled') {
      throw new Error(`Expected sell order status "filled", got "${sellBody.status}"`);
    }
    if (!sellBody.orderId || typeof sellBody.fillPrice !== 'number' || sellBody.fillPrice <= 0) {
      throw new Error('Sell order response missing orderId or valid fillPrice');
    }
    if (typeof sellBody.newCash !== 'number' || sellBody.newCash <= expectedCashAfterBuy) {
      throw new Error('Sell order newCash should be greater than cash after buy');
    }
    if (!sellBody.newPosition || sellBody.newPosition.qty !== 5 || sellBody.newPosition.symbol !== 'AAPL') {
      throw new Error('Sell order newPosition missing or incorrect (should have 5 shares remaining)');
    }

    // Verify updated position
    const positionsRes2 = await httpRequest('GET', `${ctx.baseUrl}/api/bull-pens/${bullPenId}/positions?mine=true`, {
      headers: authHeader,
    });
    if (positionsRes2.status !== 200) {
      throw new Error(`Expected 200 from list positions after sell, got ${positionsRes2.status}`);
    }
    const positionsBody2 = positionsRes2.json || {};
    const aaplPosition2 = positionsBody2.positions.find((p) => p.symbol === 'AAPL');
    if (!aaplPosition2 || Number(aaplPosition2.qty) !== 5) {
      throw new Error('AAPL position qty should be 5 after selling 5 shares');
    }
  },
  { optional: true }
);

addTest(
  'bull-pen-orders-rejection-insufficient-cash',
  'POST /api/bull-pens/{id}/orders (rejection: insufficient cash)',
  'Place buy order with cost exceeding available cash, expect status "rejected" with reason "INSUFFICIENT_CASH"',
  async (ctx) => {
    if (!ctx.googleCredential) {
      throw new Error('No Google credential provided for bull-pen-orders-rejection-insufficient-cash test');
    }

    const authRes = await httpRequest('POST', `${ctx.baseUrl}/api/auth/google`, {
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential: ctx.googleCredential }),
    });
    if (authRes.status !== 200) {
      throw new Error(`Auth step failed, expected 200, got ${authRes.status}`);
    }
    const authBody = authRes.json || {};
    if (!authBody.token) {
      throw new Error('Auth response missing backend JWT token');
    }

    const authHeader = { Authorization: `Bearer ${authBody.token}` };

    const createRes = await httpRequest('POST', `${ctx.baseUrl}/api/bull-pens`, {
      headers: { 'Content-Type': 'application/json', ...authHeader },
      body: JSON.stringify({
        name: 'Rejection Test Bull Pen',
        description: 'Testing order rejections',
        durationSec: 3600,
        maxPlayers: 10,
        startingCash: 100,
        allowFractional: false,
        approvalRequired: false,
      }),
    });

    if (createRes.status !== 201) {
      throw new Error(`Expected 201 from create bull pen, got ${createRes.status}`);
    }
    const created = (createRes.json || {}).bullPen;
    const bullPenId = created.id;

    const activateRes = await httpRequest('PATCH', `${ctx.baseUrl}/api/bull-pens/${bullPenId}`, {
      headers: { 'Content-Type': 'application/json', ...authHeader },
      body: JSON.stringify({ state: 'active' }),
    });
    if (activateRes.status !== 200) {
      throw new Error(`Expected 200 from activate bull pen, got ${activateRes.status}`);
    }

    // Try to buy 10 shares at ~100 each (total 1000, but we only have 100 cash)
    const buyRes = await httpRequest('POST', `${ctx.baseUrl}/api/bull-pens/${bullPenId}/orders`, {
      headers: { 'Content-Type': 'application/json', ...authHeader },
      body: JSON.stringify({
        symbol: 'AAPL',
        side: 'buy',
        type: 'market',
        qty: 10,
      }),
    });

    if (buyRes.status !== 200) {
      throw new Error(`Expected 200 from buy order (even if rejected), got ${buyRes.status}`);
    }
    const buyBody = buyRes.json || {};
    if (buyBody.status !== 'rejected') {
      throw new Error(`Expected buy order status "rejected", got "${buyBody.status}"`);
    }
    if (buyBody.rejectionReason !== 'INSUFFICIENT_CASH') {
      throw new Error(`Expected rejectionReason "INSUFFICIENT_CASH", got "${buyBody.rejectionReason}"`);
    }
    if (buyBody.newCash !== 100) {
      throw new Error('Cash should remain unchanged after rejected order');
    }
    if (buyBody.newPosition !== null) {
      throw new Error('newPosition should be null for rejected order');
    }
  },
  { optional: true }
);

addTest(
  'bull-pen-orders-rejection-insufficient-shares',
  'POST /api/bull-pens/{id}/orders (rejection: insufficient shares)',
  'Place sell order without holding the symbol, expect status "rejected" with reason "INSUFFICIENT_SHARES"',
  async (ctx) => {
    if (!ctx.googleCredential) {
      throw new Error('No Google credential provided for bull-pen-orders-rejection-insufficient-shares test');
    }

    const authRes = await httpRequest('POST', `${ctx.baseUrl}/api/auth/google`, {
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential: ctx.googleCredential }),
    });
    if (authRes.status !== 200) {
      throw new Error(`Auth step failed, expected 200, got ${authRes.status}`);
    }
    const authBody = authRes.json || {};
    if (!authBody.token) {
      throw new Error('Auth response missing backend JWT token');
    }

    const authHeader = { Authorization: `Bearer ${authBody.token}` };

    const createRes = await httpRequest('POST', `${ctx.baseUrl}/api/bull-pens`, {
      headers: { 'Content-Type': 'application/json', ...authHeader },
      body: JSON.stringify({
        name: 'Sell Rejection Test Bull Pen',
        description: 'Testing sell order rejections',
        durationSec: 3600,
        maxPlayers: 10,
        startingCash: 10000,
        allowFractional: false,
        approvalRequired: false,
      }),
    });

    if (createRes.status !== 201) {
      throw new Error(`Expected 201 from create bull pen, got ${createRes.status}`);
    }
    const created = (createRes.json || {}).bullPen;
    const bullPenId = created.id;

    const activateRes = await httpRequest('PATCH', `${ctx.baseUrl}/api/bull-pens/${bullPenId}`, {
      headers: { 'Content-Type': 'application/json', ...authHeader },
      body: JSON.stringify({ state: 'active' }),
    });
    if (activateRes.status !== 200) {
      throw new Error(`Expected 200 from activate bull pen, got ${activateRes.status}`);
    }

    // Try to sell shares we don't own
    const sellRes = await httpRequest('POST', `${ctx.baseUrl}/api/bull-pens/${bullPenId}/orders`, {
      headers: { 'Content-Type': 'application/json', ...authHeader },
      body: JSON.stringify({
        symbol: 'TSLA',
        side: 'sell',
        type: 'market',
        qty: 5,
      }),
    });

    if (sellRes.status !== 200) {
      throw new Error(`Expected 200 from sell order (even if rejected), got ${sellRes.status}`);
    }
    const sellBody = sellRes.json || {};
    if (sellBody.status !== 'rejected') {
      throw new Error(`Expected sell order status "rejected", got "${sellBody.status}"`);
    }
    if (sellBody.rejectionReason !== 'INSUFFICIENT_SHARES') {
      throw new Error(`Expected rejectionReason "INSUFFICIENT_SHARES", got "${sellBody.rejectionReason}"`);
    }
    if (sellBody.newCash !== 10000) {
      throw new Error('Cash should remain unchanged after rejected sell order');
    }
    if (sellBody.newPosition !== null) {
      throw new Error('newPosition should be null for rejected sell order');
    }
  },
  { optional: true }
);

async function main() {
  if (listOnly) {
    console.log('Registered API tests:');
    tests.forEach((t) => {
      console.log(`- [${t.id}] ${t.endpoint}: ${t.description}`);
    });
    return;
  }

  console.log(`${colors.cyan}Running API tests against ${baseUrl}...${colors.reset}`);

  // Try to refresh tokens if expired and interactive mode is enabled
  if (interactiveRefresh) {
    console.log(`${colors.cyan}Interactive token refresh enabled${colors.reset}`);

    if (!googleCredential || isTokenExpired(googleCredential)) {
      const freshToken = await getValidToken('TEST_GOOGLE_CREDENTIAL', true);
      if (freshToken) {
        googleCredential = freshToken;
        console.log(`${colors.green}✓${colors.reset} Refreshed TEST_GOOGLE_CREDENTIAL`);
      }
    }

    if (!secondGoogleCredential || isTokenExpired(secondGoogleCredential)) {
      const freshToken = await getValidToken('TEST_GOOGLE_CREDENTIAL_2', true);
      if (freshToken) {
        secondGoogleCredential = freshToken;
        console.log(`${colors.green}✓${colors.reset} Refreshed TEST_GOOGLE_CREDENTIAL_2`);
      }
    }
  }

  // Validate Google credentials
  if (googleCredential) {
    const tokenInfo = checkTokenExpiry(googleCredential);
    if (tokenInfo.expired) {
      console.log(`\n${colors.yellow}⚠️  WARNING: TEST_GOOGLE_CREDENTIAL has expired!${colors.reset}`);
      console.log(`   Expired at: ${tokenInfo.expiresAt?.toISOString() || 'unknown'}`);
      console.log(`   User: ${tokenInfo.email || 'unknown'}`);
      console.log(`\n   ${colors.bold}To get a fresh token:${colors.reset}`);
      console.log(`   1. Run: ${colors.cyan}node backend/getTokenFromBrowser.js${colors.reset}`);
      console.log(`   2. Or run tests with: ${colors.cyan}node backend/apiSmokeTest.js --interactive${colors.reset}`);
      console.log(`   3. Or visit: https://www.bahar.co.il/fantasybroker/login.html\n`);
    } else {
      console.log(`${colors.green}✓${colors.reset} TEST_GOOGLE_CREDENTIAL valid (expires in ${formatDuration(tokenInfo.timeLeft)})`);
    }
  }

  if (secondGoogleCredential) {
    const tokenInfo = checkTokenExpiry(secondGoogleCredential);
    if (tokenInfo.expired) {
      console.log(`${colors.yellow}⚠️  WARNING: TEST_GOOGLE_CREDENTIAL_2 has expired!${colors.reset}`);
      console.log(`   Expired at: ${tokenInfo.expiresAt?.toISOString() || 'unknown'}`);
      console.log(`   User: ${tokenInfo.email || 'unknown'}\n`);
    } else {
      console.log(`${colors.green}✓${colors.reset} TEST_GOOGLE_CREDENTIAL_2 valid (expires in ${formatDuration(tokenInfo.timeLeft)})`);
    }
  }

  const ctx = { baseUrl, googleCredential, secondGoogleCredential };
  console.log(''); // Empty line before tests start

  let passCount = 0;
  let failCount = 0;
  let skipCount = 0;

  for (const t of tests) {
    if (t.optional && !googleCredential) {
      console.log(`${colors.yellow}SKIP${colors.reset} ${t.id} (${t.endpoint}) - no Google credential provided`);
      skipCount += 1;
      continue;
    }

    process.stdout.write(`RUN  ${t.id} (${t.endpoint})... `);
    try {
      await t.run(ctx);
      console.log(`${colors.green}OK${colors.reset}`);
      passCount += 1;
    } catch (err) {
      console.log(`${colors.red}FAIL${colors.reset}`);
      console.error(`${colors.red}   Reason: ${err.message}${colors.reset}`);
      failCount += 1;
    }
  }

  console.log(`\n${colors.bold}Summary:${colors.reset} ${colors.green}${passCount} passed${colors.reset}, ${colors.red}${failCount} failed${colors.reset}, ${colors.yellow}${skipCount} skipped${colors.reset}`);
  if (failCount > 0) {
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error('Unexpected error while running tests:', err);
    process.exitCode = 1;
  });
}

