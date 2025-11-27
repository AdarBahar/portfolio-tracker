#!/usr/bin/env node

/**
 * Test script to verify MARKET_DATA_MODE behavior
 * 
 * Usage:
 *   MARKET_DATA_MODE=production node test-market-data-modes.js
 *   MARKET_DATA_MODE=debug node test-market-data-modes.js
 */

const https = require('https');

const BASE_URL = process.env.BASE_URL || 'http://localhost:4000';
const TEST_SYMBOL = 'AAPL';

function httpRequest(method, url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const client = urlObj.protocol === 'https:' ? https : require('http');
    
    const req = client.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            json: JSON.parse(data),
          });
        } catch (err) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: data,
          });
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function testMarketDataMode() {
  console.log('\n=== Testing Market Data Mode ===\n');
  console.log(`Mode: ${process.env.MARKET_DATA_MODE || 'production (default)'}`);
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Test Symbol: ${TEST_SYMBOL}\n`);

  try {
    // First call - should always hit API (or use existing cache)
    console.log('📞 Call 1: Fetching market data...');
    const res1 = await httpRequest('GET', `${BASE_URL}/api/market-data/${TEST_SYMBOL}`);
    console.log(`   Status: ${res1.status}`);
    console.log(`   Cached: ${res1.json.cached}`);
    console.log(`   Price: $${res1.json.currentPrice}`);
    console.log(`   Last Updated: ${res1.json.lastUpdated}\n`);

    // Wait 2 seconds
    console.log('⏳ Waiting 2 seconds...\n');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Second call - behavior depends on mode
    console.log('📞 Call 2: Fetching market data again...');
    const res2 = await httpRequest('GET', `${BASE_URL}/api/market-data/${TEST_SYMBOL}`);
    console.log(`   Status: ${res2.status}`);
    console.log(`   Cached: ${res2.json.cached}`);
    console.log(`   Price: $${res2.json.currentPrice}`);
    console.log(`   Last Updated: ${res2.json.lastUpdated}\n`);

    // Analysis
    console.log('=== Analysis ===\n');
    
    if (process.env.MARKET_DATA_MODE === 'debug') {
      if (res2.json.cached) {
        console.log('✅ DEBUG MODE: Second call used cache (expected behavior)');
        console.log('   This prevents repeated Finnhub API calls during testing.');
      } else {
        console.log('⚠️  DEBUG MODE: Second call hit API (unexpected!)');
        console.log('   Expected cached response in debug mode.');
      }
    } else {
      if (res2.json.cached) {
        console.log('✅ PRODUCTION MODE: Second call used cache (within 15-minute TTL)');
      } else {
        console.log('⚠️  PRODUCTION MODE: Second call hit API');
        console.log('   This is normal if cache expired or was cleared.');
      }
    }

    console.log('\n=== Test Complete ===\n');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testMarketDataMode();

