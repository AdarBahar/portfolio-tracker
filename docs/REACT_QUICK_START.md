# React Frontend - Quick Start Guide

## Overview

This guide helps you get the React frontend running locally for testing and development.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Backend API running on `http://localhost:4000`

## Quick Start

### 1. Install Dependencies

```bash
cd frontend-react
npm install
```

### 2. Create Environment File

```bash
cp .env.example .env
```

Edit `.env` if needed (default points to localhost):
```env
VITE_API_URL=http://localhost:4000/api
```

### 3. Start Development Server

```bash
npm run dev
```

The app will be available at: `http://localhost:5173/react/`

### 4. Build for Production

```bash
npm run build
```

Output will be in `frontend-react/dist/`

## Available Pages

- **Dashboard** - `http://localhost:5173/react/dashboard`
- **Trade Room** - `http://localhost:5173/react/trade-room`
- **Admin** - `http://localhost:5173/react/admin`

## Development Tips

### Hot Module Replacement (HMR)

Changes to React components are automatically reflected in the browser without full page reload.

### TypeScript

All components are written in TypeScript. Type checking is performed during build.

### Tailwind CSS

Styling uses Tailwind CSS utility classes. Design tokens are configured in `tailwind.config.ts`.

### API Integration

The API client is configured in `src/lib/api.ts`. It automatically:
- Adds authentication tokens from localStorage
- Handles 401 errors by redirecting to login
- Provides retry logic for failed requests

## Troubleshooting

### Port Already in Use

If port 5173 is already in use, Vite will use the next available port.

### API Connection Issues

1. Verify backend is running on port 4000
2. Check `VITE_API_URL` in `.env`
3. Look for CORS errors in browser console

### Build Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

## Next Steps

1. Test API integration with real endpoints
2. Implement authentication flow
3. Add more pages and components
4. Set up unit tests
5. Deploy to production server

## Support

For issues or questions, refer to:
- `docs/REACT_MIGRATION_FEASIBILITY_PLAN.md` - Detailed plan
- `docs/REACT_DEPLOYMENT_GUIDE.md` - Production deployment
- `frontend-react/README.md` - Project documentation

