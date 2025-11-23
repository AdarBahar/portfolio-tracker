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
const googleCredential = getArg('--google-credential') || process.env.TEST_GOOGLE_CREDENTIAL || null;
const listOnly = process.argv.includes('--list') || process.argv.includes('-l');

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
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const body = res.json || {};
    if (!body.user || !body.token) throw new Error('Response missing user or token');
    if (!body.user.email || typeof body.user.id === 'undefined') {
      throw new Error('User object missing email or id');
    }
  },
  { optional: true }
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


async function main() {
  if (listOnly) {
    console.log('Registered API tests:');
    tests.forEach((t) => {
      console.log(`- [${t.id}] ${t.endpoint}: ${t.description}`);
    });
    return;
  }

  const ctx = { baseUrl, googleCredential };
  console.log(`Running API tests against ${baseUrl}...`);

  let passCount = 0;
  let failCount = 0;
  let skipCount = 0;

  for (const t of tests) {
    if (t.optional && !googleCredential) {
      console.log(`SKIP ${t.id} (${t.endpoint}) - no Google credential provided`);
      skipCount += 1;
      continue;
    }

    process.stdout.write(`RUN  ${t.id} (${t.endpoint})... `);
    try {
      await t.run(ctx);
      console.log('OK');
      passCount += 1;
    } catch (err) {
      console.log('FAIL');
      console.error(`   Reason: ${err.message}`);
      failCount += 1;
    }
  }

  console.log(`\nSummary: ${passCount} passed, ${failCount} failed, ${skipCount} skipped`);
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

