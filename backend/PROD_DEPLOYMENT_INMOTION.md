# Production Deployment – InMotion Hosting

This guide explains how to deploy the **Portfolio Tracker backend** to **InMotion Hosting** using cPanel’s Node.js application feature.

The examples use these production settings (which you are already using):

- Application root (on server): `public_html/fantasybroker/backend`
- Application URL (base path): `/fantasybroker-api`
- Startup file: `src/server.js`

---

## 1. Prerequisites

- InMotion account with **cPanel** and **Node.js App** support
- A MySQL database created from `schema.mysql.sql` (on the same hosting account)
- Local project cloned at:
  - `…/portfolio-tracker/backend`
- Node.js and npm installed **locally**

---

## 2. Build the backend locally

1. On your local machine, from the project root:

   ```bash
   cd backend
   npm install
   npm run build
   ```

2. After this command, you should have:

   ```text
   backend/
     dist/
       src/
       openapi.json
       package.json
       .env.example
   ```

The `dist/` folder is what you will upload to the server.

---

## 3. Upload files to InMotion via FTP

1. Connect to the server via FTP.
2. Navigate to your InMotion account’s `public_html/fantasybroker` directory.
3. Create a folder named `backend` if it does not exist:

   ```text
   public_html/
     fantasybroker/
       backend/
   ```

4. Upload **all contents of `backend/dist/`** into `public_html/fantasybroker/backend/`, so on the server you have:

   ```text
   public_html/fantasybroker/backend/
     package.json
     openapi.json
     .env.example      # for reference only; no secrets
     src/
       server.js
       app.js
       db.js
       ...
   ```

> Do **not** upload any local `.env` files containing credentials.

---

## 4. Create the Node.js app in cPanel

1. Log in to **cPanel**.
2. Open **Setup Node.js App**.
3. Click **Create Application** and fill in:

   - **Node.js version**: use a stable LTS (e.g. `24.6.0` if available and supported).
   - **Application mode**: `Production`.
   - **Application root**: `public_html/fantasybroker/backend`
   - **Application URL**: `/fantasybroker-api`
   - **Application startup file**: `src/server.js`

4. Save / create the application.

cPanel will create a Node.js app that routes requests under `/fantasybroker-api` to `src/server.js`.

---

## 5. Configure environment variables

The backend expects several environment variables. Configure them in the **Setup Node.js App** UI (recommended) or via a `.env` file inside `public_html/fantasybroker/backend`.

### 5.1 Required variables

Set at least:

- `PORT` – let InMotion manage this, or set a fixed port if documented
- `DB_HOST` – MySQL host (often `localhost` or a host name from cPanel)
- `DB_PORT` – normally `3306`
- `DB_USER` – your MySQL username
- `DB_PASSWORD` – your MySQL password
- `DB_NAME` – database name, e.g. `portfolio_tracker`
- `JWT_SECRET` – a strong random secret string (do not reuse it elsewhere)
- `GOOGLE_CLIENT_ID` – your Google OAuth client ID (same value used in the frontend)
- `API_BASE_PATH` – **set this to** `/fantasybroker-api`

With `API_BASE_PATH=/fantasybroker-api`, the backend’s routes are:

- `/fantasybroker-api/api/health`
- `/fantasybroker-api/api/docs`
- `/fantasybroker-api/api/openapi.json`
- `/fantasybroker-api/api/auth/...`

If you use a `.env` file on the server, it should be created **manually** on the server and not copied from local development.

---

## 6. Install dependencies on the server

From the **Setup Node.js App** page in cPanel for this app:

1. Click **Run NPM Install** (or similar).
2. This will run `npm install` inside `public_html/fantasybroker/backend` and create `node_modules/` there.

You only need to do this again after changing `package.json` or adding dependencies.

---

## 7. Start / restart the application

1. In **Setup Node.js App**, find your app.
2. Click **Restart App** (or **Start App** if it is stopped).
3. Wait for the status to update.

---

## 8. Verify the deployment

Open a browser and test:

- Health check:

  ```text
  https://www.bahar.co.il/fantasybroker-api/api/health
  ```

  Expected response:

  ```json
  { "status": "ok" }
  ```

- Swagger UI:

  ```text
  https://www.bahar.co.il/fantasybroker-api/api/docs
  ```

- OpenAPI JSON:

  ```text
  https://www.bahar.co.il/fantasybroker-api/api/openapi.json
  ```

If these endpoints work, the backend is correctly configured.

---

## 9. Updating the backend

When you change backend code:

1. On your local machine:

   ```bash
   cd backend
   npm run build
   ```

2. Re-upload **contents of `backend/dist/`** to `public_html/fantasybroker/backend/` (overwriting existing files).
3. In cPanel, go to **Setup Node.js App** and click **Restart App**.

Your production backend will now run the latest version.

