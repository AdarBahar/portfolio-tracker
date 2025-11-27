#!/usr/bin/env node
/**
 * Budget API Test Suite
 * Tests the public and internal budget endpoints
 */

const http = require('http');
const BASE_URL = process.env.API_BASE_URL || 'http://localhost:4000';
const INTERNAL_SERVICE_TOKEN = process.env.INTERNAL_SERVICE_TOKEN || 'change-me-in-env';
const USER_TOKEN = process.env.TEST_GOOGLE_CREDENTIAL || 'test-token';

let testsPassed = 0;
let testsFailed = 0;

function makeRequest(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            body: data ? JSON.parse(data) : null,
            headers: res.headers
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            body: data,
            headers: res.headers
          });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function test(name, fn) {
  try {
    await fn();
    console.log(`✓ ${name}`);
    testsPassed++;
  } catch (err) {
    console.log(`✗ ${name}`);
    console.log(`  Error: ${err.message}`);
    testsFailed++;
  }
}

async function runTests() {
  console.log('Budget API Test Suite\n');

  // Test 1: Get current budget (public endpoint)
  await test('GET /api/v1/budget - requires authentication', async () => {
    const res = await makeRequest('GET', '/api/v1/budget');
    if (res.status !== 401) {
      throw new Error(`Expected 401, got ${res.status}`);
    }
  });

  // Test 2: Get budget logs (public endpoint)
  await test('GET /api/v1/budget/logs - requires authentication', async () => {
    const res = await makeRequest('GET', '/api/v1/budget/logs');
    if (res.status !== 401) {
      throw new Error(`Expected 401, got ${res.status}`);
    }
  });

  // Test 3: Credit budget without idempotency key
  await test('POST /internal/v1/budget/credit - requires Idempotency-Key', async () => {
    const res = await makeRequest('POST', '/internal/v1/budget/credit', 
      { user_id: 1, amount: 100, operation_type: 'TEST_CREDIT' },
      { 'Authorization': `Bearer ${INTERNAL_SERVICE_TOKEN}` }
    );
    if (res.status !== 400) {
      throw new Error(`Expected 400, got ${res.status}`);
    }
  });

  // Test 4: Credit budget without service token
  await test('POST /internal/v1/budget/credit - requires service token', async () => {
    const res = await makeRequest('POST', '/internal/v1/budget/credit',
      { user_id: 1, amount: 100, operation_type: 'TEST_CREDIT' },
      { 'Idempotency-Key': 'test-key-1' }
    );
    if (res.status !== 403) {
      throw new Error(`Expected 403, got ${res.status}`);
    }
  });

  // Test 5: Debit budget without idempotency key
  await test('POST /internal/v1/budget/debit - requires Idempotency-Key', async () => {
    const res = await makeRequest('POST', '/internal/v1/budget/debit',
      { user_id: 1, amount: 100, operation_type: 'TEST_DEBIT' },
      { 'Authorization': `Bearer ${INTERNAL_SERVICE_TOKEN}` }
    );
    if (res.status !== 400) {
      throw new Error(`Expected 400, got ${res.status}`);
    }
  });

  // Test 6: Credit with invalid amount
  await test('POST /internal/v1/budget/credit - rejects negative amount', async () => {
    const res = await makeRequest('POST', '/internal/v1/budget/credit',
      { user_id: 1, amount: -100, operation_type: 'TEST_CREDIT' },
      { 
        'Authorization': `Bearer ${INTERNAL_SERVICE_TOKEN}`,
        'Idempotency-Key': 'test-key-2'
      }
    );
    if (res.status !== 400) {
      throw new Error(`Expected 400, got ${res.status}`);
    }
  });

  console.log(`\n${testsPassed} passed, ${testsFailed} failed`);
  process.exit(testsFailed > 0 ? 1 : 0);
}

runTests().catch(err => {
  console.error('Test suite error:', err);
  process.exit(1);
});

