#!/usr/bin/env node
/**
 * Test script for Finnhub API integration
 * Usage: node test-finnhub.js [SYMBOL]
 */

require('dotenv').config();
const { fetchPriceFromAPI } = require('./src/controllers/marketDataController');

const symbol = process.argv[2] || 'AAPL';

console.log(`\n🔍 Testing Finnhub API integration for ${symbol}...\n`);

fetchPriceFromAPI(symbol)
  .then((data) => {
    console.log('✅ Success!\n');
    console.log('Symbol:', symbol);
    console.log('Current Price: $' + data.price.toFixed(2));
    console.log('Company Name:', data.companyName);
    console.log('Change %:', data.changePercent.toFixed(2) + '%');
    console.log('\n✓ Finnhub integration is working correctly\n');
  })
  .catch((err) => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });

