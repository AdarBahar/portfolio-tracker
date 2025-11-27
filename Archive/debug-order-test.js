/**
 * Debug script to test bull pen order placement and capture detailed error info
 * 
 * Usage:
 *   node backend/debug-order-test.js --base-url https://www.bahar.co.il/fantasybroker-api --google-credential "JWT"
 */

const https = require('https');
const http = require('http');
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
      timeout: options.timeout || 10000,
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

async function debugOrderTest() {
  const baseUrl = getArg('--base-url') || 'http://localhost:4000';
  const googleCredential = getArg('--google-credential');

  if (!googleCredential) {
    console.error('❌ Error: --google-credential required');
    console.log('Usage: node backend/debug-order-test.js --base-url URL --google-credential JWT');
    process.exit(1);
  }

  console.log('🔍 Debug Order Test');
  console.log('Base URL:', baseUrl);
  console.log('');

  try {
    // Step 1: Authenticate
    console.log('Step 1: Authenticating...');
    const authRes = await httpRequest('POST', `${baseUrl}/api/auth/google`, {
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential: googleCredential }),
    });

    if (authRes.status !== 200) {
      console.error('❌ Auth failed:', authRes.status, authRes.json);
      process.exit(1);
    }

    const token = authRes.json.token;
    console.log('✅ Authenticated');
    console.log('');

    // Step 2: Create bull pen
    console.log('Step 2: Creating bull pen...');
    const createRes = await httpRequest('POST', `${baseUrl}/api/bull-pens`, {
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: 'Debug Test Bull Pen',
        description: 'Testing order placement',
        durationSec: 3600,
        maxPlayers: 10,
        startingCash: 10000,
        allowFractional: true,
        approvalRequired: false,
      }),
    });

    if (createRes.status !== 201) {
      console.error('❌ Create bull pen failed:', createRes.status, createRes.json);
      process.exit(1);
    }

    const bullPenId = createRes.json.bullPen.id;
    console.log('✅ Bull pen created, ID:', bullPenId);
    console.log('');

    // Step 3: Activate bull pen
    console.log('Step 3: Activating bull pen...');
    const activateRes = await httpRequest('PATCH', `${baseUrl}/api/bull-pens/${bullPenId}`, {
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ state: 'active' }),
    });

    if (activateRes.status !== 200) {
      console.error('❌ Activate failed:', activateRes.status, activateRes.json);
      process.exit(1);
    }

    console.log('✅ Bull pen activated');
    console.log('');

    // Step 4: Place buy order
    console.log('Step 4: Placing buy order...');
    console.log('Request body:', JSON.stringify({
      symbol: 'AAPL',
      side: 'buy',
      type: 'market',
      qty: 10,
    }, null, 2));
    console.log('');

    const buyRes = await httpRequest('POST', `${baseUrl}/api/bull-pens/${bullPenId}/orders`, {
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        symbol: 'AAPL',
        side: 'buy',
        type: 'market',
        qty: 10,
      }),
    });

    console.log('Response status:', buyRes.status);
    console.log('Response headers:', buyRes.headers);
    console.log('Response body (raw):', buyRes.rawBody);
    console.log('Response body (JSON):', JSON.stringify(buyRes.json, null, 2));

    if (buyRes.status !== 200) {
      console.error('');
      console.error('❌ Buy order failed with status', buyRes.status);
      console.error('Error details:', buyRes.json);
    } else {
      console.log('');
      console.log('✅ Buy order succeeded!');
      console.log('Order details:', buyRes.json);
    }

  } catch (error) {
    console.error('');
    console.error('❌ Unexpected error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

debugOrderTest();

