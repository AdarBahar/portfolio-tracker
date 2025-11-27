#!/usr/bin/env node
/**
 * Helper script to extract auth token from browser localStorage
 * 
 * Usage:
 *   1. Open your app in browser and sign in with Google
 *   2. Run this script: node backend/getTokenFromBrowser.js
 *   3. Follow the instructions to paste the token
 * 
 * Or use the bookmarklet version (see instructions below)
 */

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n=== Google Auth Token Extractor ===\n');
console.log('This script helps you extract the auth token from your browser for testing.\n');

console.log('📋 INSTRUCTIONS:\n');
console.log('1. Open your app in the browser:');
console.log('   https://www.bahar.co.il/fantasybroker/login.html\n');
console.log('2. Sign in with Google\n');
console.log('3. Open DevTools (F12) → Console tab\n');
console.log('4. Run this command in the browser console:');
console.log('   \x1b[36mlocalStorage.getItem(\'authToken\')\x1b[0m\n');
console.log('5. The token will appear in the console. To get the FULL token:');
console.log('   • Click on the string to expand it (if truncated)');
console.log('   • Or right-click → "Copy string contents"');
console.log('   • Or hover and click "view source" to see the full value\n');
console.log('6. Copy the FULL token (without quotes) and paste it below\n');

console.log('─'.repeat(60));
console.log('\n💡 ALTERNATIVE METHOD (Easier - Auto-copy to clipboard):\n');
console.log('Run this in the browser console to copy the token automatically:');
console.log('\x1b[36mcopy(localStorage.getItem(\'authToken\'))\x1b[0m');
console.log('Then just paste it below!\n');
console.log('─'.repeat(60));
console.log('\n💡 BOOKMARKLET (Quickest):\n');
console.log('Create a bookmark with this JavaScript code:');
console.log('\x1b[33mjavascript:(function(){const t=localStorage.getItem(\'authToken\');if(t){prompt(\'Auth Token (Ctrl+C to copy):\',t)}else{alert(\'No token found. Please sign in first.\')}})()\x1b[0m\n');
console.log('─'.repeat(60));
console.log('');

rl.question('Paste your token here: ', (token) => {
  token = token.trim();
  
  if (!token) {
    console.log('\n❌ No token provided. Exiting.\n');
    rl.close();
    return;
  }
  
  // Validate JWT format (3 parts separated by dots)
  const parts = token.split('.');
  if (parts.length !== 3) {
    console.log('\n❌ Invalid token format. JWT tokens should have 3 parts separated by dots.\n');
    rl.close();
    return;
  }
  
  try {
    // Decode the payload (middle part)
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    
    console.log('\n✅ Token validated!\n');
    console.log('Token Info:');
    console.log('  User:', payload.email || payload.sub);
    console.log('  Issued:', new Date(payload.iat * 1000).toISOString());
    console.log('  Expires:', new Date(payload.exp * 1000).toISOString());
    
    const now = Math.floor(Date.now() / 1000);
    const timeLeft = payload.exp - now;
    
    if (timeLeft > 0) {
      const hours = Math.floor(timeLeft / 3600);
      const minutes = Math.floor((timeLeft % 3600) / 60);
      console.log('  Time left:', `${hours}h ${minutes}m`);
      console.log('  Status: \x1b[32m✓ Valid\x1b[0m');
    } else {
      console.log('  Status: \x1b[31m✗ Expired\x1b[0m');
      console.log('\n⚠️  This token has expired. Please sign in again to get a fresh token.\n');
      rl.close();
      return;
    }
    
    console.log('\n📝 Export commands:\n');
    console.log(`export TEST_GOOGLE_CREDENTIAL="${token}"`);
    console.log('\nOr for the second user:');
    console.log(`export TEST_GOOGLE_CREDENTIAL_2="${token}"`);
    console.log('\n');
    
  } catch (err) {
    console.log('\n❌ Failed to decode token:', err.message);
    console.log('Make sure you copied the entire token.\n');
  }
  
  rl.close();
});

