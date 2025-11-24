# Google Sign-In DevTools Console Issue

## Problem

When signing in with Google, a DevTools console window opens in the popup and closes when login completes.

## Root Cause

This is not standard Google Sign-In behavior. It's likely caused by one of:

1. **Browser Extension** - A debugging or development extension
2. **Browser DevTools Setting** - "Pause on caught exceptions" or similar
3. **Google's Internal Debugging** - Rare, but possible in certain configurations

## Solutions

### Solution 1: Check Browser Extensions (Most Likely)

1. Open Chrome/Edge → Extensions (chrome://extensions/)
2. Look for debugging/development extensions:
   - React Developer Tools
   - Redux DevTools
   - Vue DevTools
   - Any "Auto DevTools" extensions
3. Disable them temporarily and test login again

### Solution 2: Check DevTools Settings

1. Open DevTools (F12)
2. Click Settings (gear icon) → Preferences
3. Uncheck:
   - "Pause on caught exceptions"
   - "Pause on uncaught exceptions"
   - "Auto-open DevTools for popups"
4. Close DevTools and test login again

### Solution 3: Clear Browser Data

1. Open Chrome → Settings → Privacy and security
2. Clear browsing data
3. Select "Cached images and files" and "Cookies and other site data"
4. Clear data and test login again

### Solution 4: Try Incognito/Private Mode

1. Open an Incognito/Private window
2. Navigate to the login page
3. Test Google Sign-In
4. If it works without DevTools opening, it confirms an extension is the cause

### Solution 5: Use a Different Browser

Test in:
- Firefox
- Safari
- Edge (if using Chrome)
- Chrome (if using Edge)

If the issue doesn't occur in another browser, it's browser-specific.

## Code Changes (Already Applied)

I've added `data-itp_support="true"` to the Google Sign-In configuration in `login.html`:

```html
<div id="g_id_onload"
     data-client_id=""
     data-context="signin"
     data-ux_mode="popup"
     data-callback="handleCredentialResponse"
     data-auto_prompt="false"
     data-itp_support="true">
</div>
```

This helps with Intelligent Tracking Prevention (ITP) in Safari and some popup issues.

## Alternative: Switch to Redirect Mode (If Issue Persists)

If the popup DevTools issue continues, we can switch from popup mode to redirect mode:

**Pros:**
- No popup window (no DevTools issue)
- Better mobile experience
- More reliable across browsers

**Cons:**
- Requires page reload
- Slightly more complex implementation

Let me know if you want to implement redirect mode instead.

## Debugging Steps

To identify the exact cause:

1. **Check Console for Errors:**
   - Open DevTools on the main page (not popup)
   - Look for any errors or warnings
   - Check if any scripts are trying to open DevTools

2. **Check Network Tab:**
   - See if any requests are triggering DevTools
   - Look for suspicious scripts loading

3. **Check Browser Console:**
   - Run: `window.open = new Proxy(window.open, { apply(target, thisArg, args) { console.trace('window.open called'); return target.apply(thisArg, args); } })`
   - This will log any window.open calls with stack traces

## Recommended Action

1. **First:** Check browser extensions (most likely cause)
2. **Second:** Try incognito mode to confirm
3. **Third:** If issue persists, let me know and I'll implement redirect mode

The DevTools opening is definitely not normal Google Sign-In behavior, so it's almost certainly a browser extension or setting.

