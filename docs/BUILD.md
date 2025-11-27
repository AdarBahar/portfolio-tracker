# Backend Build Process

This document describes how to build the **Portfolio Tracker backend** into a deployable bundle. Deployment itself will be handled separately (e.g., by your deployment script or platform).

## 1. Prerequisites

- Node.js (LTS recommended)
- npm
- MySQL database created from `schema.mysql.sql`

From the `backend/` directory:

```bash
cd backend
npm install
```

## 2. Build Command

The backend uses a simple file-based build process that prepares a `dist/` folder containing everything needed to run the service in production.

From `backend/`:

```bash
npm run build
```

This command will:

1. Remove any existing `dist/` directory
2. Create a fresh `dist/` directory
3. Copy the following into `dist/`:
   - `src/` (all backend source files)
   - `openapi.json` (OpenAPI/Swagger spec)
   - `package.json` (for installing runtime dependencies on the server)
   - `.env.example` (for reference when configuring environment variables)

After running, the structure will look like:

```text
backend/
  dist/
    src/
    openapi.json
    package.json
    .env.example
```

Your deployment script can then take the `backend/dist` directory and push it to your production environment.

## 3. Running in Production (Conceptual)

In your deployment environment (server, container, etc.):

```bash
cd /path/to/dist
npm install --production
# or: npm ci --only=production

# Configure environment variables (e.g., via .env or platform config)
#   - PORT
#   - DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
#   - JWT_SECRET
#   - GOOGLE_CLIENT_ID

NODE_ENV=production node src/server.js
```

## 4. Endpoints Summary

Once running, the backend exposes (so far):

- `GET /api/health` — health check
- `GET /api/openapi.json` — OpenAPI spec (JSON)
- `GET /api/docs` — Swagger UI (interactive docs)
- `POST /api/auth/google` — Google authentication

As we add more endpoints (holdings, dividends, transactions), they will be included automatically in the `openapi.json` and visible in Swagger UI.

