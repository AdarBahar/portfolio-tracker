# Detailed Auth Test

## Run This in Browser Console

This will show us EXACTLY what's being sent and received:

```javascript
(async function() {
    console.log('=== DETAILED AUTH TEST ===\n');
    
    // 1. Check token
    const token = localStorage.getItem('portfolio_auth_token');
    console.log('1. Token from localStorage:');
    console.log('   Exists:', !!token);
    console.log('   Length:', token ? token.length : 0);
    console.log('   First 50 chars:', token ? token.substring(0, 50) + '...' : 'N/A');
    
    if (!token) {
        console.log('\n❌ NO TOKEN!');
        return;
    }
    
    // 2. Decode token
    console.log('\n2. Token payload:');
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('   ', JSON.stringify(payload, null, 2));
    
    // 3. Check authManager
    console.log('\n3. authManager.getAuthHeader():');
    const authHeader = authManager.getAuthHeader();
    console.log('   ', authHeader);
    
    // 4. Make request with detailed logging
    console.log('\n4. Making request...');
    const url = 'https://www.bahar.co.il/fantasybroker-api/api/admin/users';
    console.log('   URL:', url);
    console.log('   Headers:', authHeader);
    
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: authHeader
        });
        
        console.log('\n5. Response:');
        console.log('   Status:', response.status, response.statusText);
        console.log('   Headers:', Object.fromEntries(response.headers.entries()));
        
        const text = await response.text();
        console.log('   Body:', text);
        
        if (response.status === 401) {
            console.log('\n❌ 401 UNAUTHORIZED');
            console.log('   The backend is rejecting the token.');
            console.log('   Response body:', text);
            
            // Try to parse error
            try {
                const error = JSON.parse(text);
                console.log('   Error message:', error.error);
            } catch (e) {
                console.log('   Raw error:', text);
            }
        } else if (response.status === 200) {
            console.log('\n✅ SUCCESS!');
        }
    } catch (e) {
        console.log('\n❌ Request failed:', e);
    }
    
    console.log('\n=== END TEST ===');
})();
```

## What We're Looking For

The response body will tell us WHY the backend is rejecting the token:

- `"Missing or invalid Authorization header"` → Token not being sent
- `"Invalid or expired token"` → JWT verification failed (JWT_SECRET mismatch)
- `"Admin privileges required"` → Token valid but isAdmin is false
- `"No token provided"` → Authorization header missing

## Run this and share the output!

Specifically, look for the "Response Body" line - that will tell us exactly what the backend is saying.

