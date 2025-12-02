# Debug Mode Badge Implementation

## Overview

Added a visual debug badge to the React UI that displays when `MARKET_DATA_MODE=debug` is set on the backend. This helps developers quickly identify when the system is running in debug mode with throttled Finnhub API requests.

---

## What Was Implemented

### 1. New Hook: `useDebugMode.ts`
**Location:** `frontend-react/src/hooks/useDebugMode.ts`

- Fetches the `/api/health` endpoint to check `marketDataMode`
- Returns `true` if mode is `'debug'`, `false` otherwise
- Uses React Query for caching (1-minute stale time, 5-minute refetch interval)
- Gracefully handles errors (defaults to `false` if health check fails)

### 2. New Component: `DebugBadge.tsx`
**Location:** `frontend-react/src/components/DebugBadge.tsx`

- Displays a yellow badge with "DEBUG MODE" text
- Uses AlertCircle icon from lucide-react
- Only renders when debug mode is active
- Styled with Tailwind CSS for consistency

### 3. Updated Component: `TopBar.tsx`
**Location:** `frontend-react/src/components/dashboard/TopBar.tsx`

- Imported `DebugBadge` component
- Added badge display next to the logo
- Badge appears on the left side of the header for visibility

---

## How It Works

### Backend Exposure
The backend already exposes debug mode status via the health endpoint:

```javascript
// backend/src/app.js
app.get(`${BASE_PATH}/api/health`, async (req, res) => {
  return res.json({
    status: 'ok',
    db: 'ok',
    marketDataMode: process.env.MARKET_DATA_MODE || 'production'
  });
});
```

### Frontend Detection
1. `useDebugMode()` hook calls `/api/health`
2. Checks if `marketDataMode === 'debug'`
3. `DebugBadge` component conditionally renders based on result
4. Badge appears in TopBar header

---

## Visual Appearance

**When Debug Mode is Active:**
- Yellow badge with alert icon
- Text: "DEBUG MODE"
- Location: Top-left header, next to logo
- Styling: `bg-yellow-500/20 border border-yellow-500/50`

**When Production Mode:**
- Badge is hidden (not rendered)

---

## Environment Setup

### To Enable Debug Mode

Set in `backend/.env`:
```bash
MARKET_DATA_MODE=debug
```

### To Disable Debug Mode

Set in `backend/.env`:
```bash
MARKET_DATA_MODE=production
```

Or leave unset (defaults to `production`)

---

## Build Status

✅ TypeScript compilation: PASSED (zero errors)  
✅ Vite build: PASSED  
✅ Bundle size: 444.33 kB (gzip: 130.04 kB)  
✅ All modules: 1850 transformed  

---

## Files Modified/Created

| File | Type | Status |
|------|------|--------|
| `src/hooks/useDebugMode.ts` | Created | ✅ |
| `src/components/DebugBadge.tsx` | Created | ✅ |
| `src/components/dashboard/TopBar.tsx` | Modified | ✅ |

---

## Testing

To test the debug badge:

1. **Enable debug mode:**
   ```bash
   # In backend/.env
   MARKET_DATA_MODE=debug
   ```

2. **Restart backend server**

3. **Refresh React UI** - Badge should appear in top-left header

4. **Disable debug mode:**
   ```bash
   # In backend/.env
   MARKET_DATA_MODE=production
   ```

5. **Restart backend and refresh** - Badge should disappear

---

**Implementation Complete! 🎉**

