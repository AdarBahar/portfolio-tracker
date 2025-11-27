/**
 * Budget Integration Tests
 * Tests all budget operations with real database
 * 
 * Prerequisites:
 * - Database must be running and accessible
 * - Test users must exist in database
 * - INTERNAL_SERVICE_TOKEN must be set in .env
 */

const http = require('http');
const assert = require('assert');

const BASE_URL = 'http://localhost:4000';
const INTERNAL_SERVICE_TOKEN = process.env.INTERNAL_SERVICE_TOKEN || 'test-token';
const TEST_USER_ID = 1;
const TEST_USER_2_ID = 2;

// Helper to make HTTP requests
function makeRequest(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${INTERNAL_SERVICE_TOKEN}`,
        'Idempotency-Key': `test-${Date.now()}-${Math.random()}`,
        ...headers
      }
    };

    const req = http.request(options, (res) => {
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
          resolve({ status: res.statusCode, body: data, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

// Test suite
async function runTests() {
  console.log('🧪 Starting Budget Integration Tests\n');
  let passed = 0, failed = 0;

  try {
    // Test 1: Credit budget
    console.log('Test 1: Credit budget');
    const creditRes = await makeRequest('POST', '/internal/v1/budget/credit', {
      user_id: TEST_USER_ID,
      amount: 100,
      operation_type: 'TEST_CREDIT',
      currency: 'VUSD'
    });
    assert.strictEqual(creditRes.status, 200, `Expected 200, got ${creditRes.status}`);
    assert(creditRes.body.balance_after > creditRes.body.balance_before);
    console.log('✓ PASSED\n');
    passed++;

    // Test 2: Debit budget
    console.log('Test 2: Debit budget');
    const debitRes = await makeRequest('POST', '/internal/v1/budget/debit', {
      user_id: TEST_USER_ID,
      amount: 50,
      operation_type: 'TEST_DEBIT',
      currency: 'VUSD'
    });
    assert.strictEqual(debitRes.status, 200);
    assert(debitRes.body.balance_after < debitRes.body.balance_before);
    console.log('✓ PASSED\n');
    passed++;

    // Test 3: Lock budget
    console.log('Test 3: Lock budget');
    const lockRes = await makeRequest('POST', '/internal/v1/budget/lock', {
      user_id: TEST_USER_ID,
      amount: 25,
      operation_type: 'TEST_LOCK',
      currency: 'VUSD'
    });
    assert.strictEqual(lockRes.status, 200);
    assert(lockRes.body.locked_balance > 0);
    console.log('✓ PASSED\n');
    passed++;

    // Test 4: Unlock budget
    console.log('Test 4: Unlock budget');
    const unlockRes = await makeRequest('POST', '/internal/v1/budget/unlock', {
      user_id: TEST_USER_ID,
      amount: 25,
      operation_type: 'TEST_UNLOCK',
      currency: 'VUSD'
    });
    assert.strictEqual(unlockRes.status, 200);
    console.log('✓ PASSED\n');
    passed++;

    // Test 5: Transfer budget
    console.log('Test 5: Transfer budget');
    const transferRes = await makeRequest('POST', '/internal/v1/budget/transfer', {
      from_user_id: TEST_USER_ID,
      to_user_id: TEST_USER_2_ID,
      amount: 30,
      operation_type_out: 'TEST_TRANSFER_OUT',
      operation_type_in: 'TEST_TRANSFER_IN'
    });
    assert.strictEqual(transferRes.status, 200);
    assert(transferRes.body.from_log_id && transferRes.body.to_log_id);
    console.log('✓ PASSED\n');
    passed++;

    // Test 6: Adjust budget
    console.log('Test 6: Adjust budget');
    const adjustRes = await makeRequest('POST', '/internal/v1/budget/adjust', {
      user_id: TEST_USER_ID,
      amount: 10,
      direction: 'IN',
      operation_type: 'TEST_ADJUSTMENT',
      created_by: 'admin:1'
    });
    assert.strictEqual(adjustRes.status, 200);
    console.log('✓ PASSED\n');
    passed++;

    // Test 7: Idempotency
    console.log('Test 7: Idempotency (same key returns cached result)');
    const idempotencyKey = `idempotent-test-${Date.now()}`;
    const res1 = await makeRequest('POST', '/internal/v1/budget/credit', {
      user_id: TEST_USER_ID,
      amount: 50,
      operation_type: 'TEST_IDEMPOTENT'
    }, { 'Idempotency-Key': idempotencyKey });
    
    const res2 = await makeRequest('POST', '/internal/v1/budget/credit', {
      user_id: TEST_USER_ID,
      amount: 50,
      operation_type: 'TEST_IDEMPOTENT'
    }, { 'Idempotency-Key': idempotencyKey });
    
    assert.strictEqual(res1.body.log_id, res2.body.log_id, 'Log IDs should match');
    assert.strictEqual(res2.body.idempotent, true, 'Second call should be idempotent');
    console.log('✓ PASSED\n');
    passed++;

    // Test 8: Insufficient funds
    console.log('Test 8: Insufficient funds error');
    const insufficientRes = await makeRequest('POST', '/internal/v1/budget/debit', {
      user_id: TEST_USER_ID,
      amount: 999999,
      operation_type: 'TEST_INSUFFICIENT'
    });
    assert.strictEqual(insufficientRes.status, 400);
    assert.strictEqual(insufficientRes.body.error, 'INSUFFICIENT_FUNDS');
    console.log('✓ PASSED\n');
    passed++;

  } catch (err) {
    console.error('✗ FAILED:', err.message);
    failed++;
  }

  console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(err => {
  console.error('Test suite error:', err);
  process.exit(1);
});

