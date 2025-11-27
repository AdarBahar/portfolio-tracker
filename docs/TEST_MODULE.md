# Backend Test Module

This module explains how to run the backend tests for the Portfolio Tracker / FantasyBroker project.

At the moment, tests focus on **API smoke testing** of the Node + Express backend. They are implemented in:

- `backend/apiSmokeTest.js`
- Documented in detail in `backend/API_TESTS.md`

As the project evolves, you can add more automated tests (e.g. unit tests with Jest/Mocha) and extend this document.

---

## 1. Prerequisites

- **Node.js** installed (any recent LTS is fine).
- Backend deployed and reachable, either:
  - **Locally:** e.g. `http://localhost:4000` with `API_BASE_PATH=""`, or
  - **Production:** `https://www.bahar.co.il/fantasybroker-api` with `API_BASE_PATH="/fantasybroker-api"`.

You do **not** need database access from your local machine; the script talks to the running backend over HTTP/HTTPS.

---

## 2. API Smoke Tests (`backend/apiSmokeTest.js`)

These are end-to-end HTTP tests that verify the main backend capabilities:

- `/api/health` (API + DB health)
- `/api/openapi.json` (OpenAPI spec served correctly)
- `/api/auth/google` (Google auth error paths + optional happy path)

For full details of what each test checks, see **`backend/API_TESTS.md`**.

### 2.1. List available tests

From the **repo root**:

<augment_code_snippet mode="EXCERPT">
````bash
node backend/apiSmokeTest.js --list
````
</augment_code_snippet>

From inside the **backend directory**:

<augment_code_snippet mode="EXCERPT">
````bash
cd backend
node apiSmokeTest.js --list
````
</augment_code_snippet>

This prints all registered tests with their IDs, endpoints, and descriptions.

### 2.2. Run tests against local backend

Assuming your backend is running locally on port 4000 with `API_BASE_PATH=""`:

From **repo root**:

<augment_code_snippet mode="EXCERPT">
````bash
node backend/apiSmokeTest.js --base-url http://localhost:4000
````
</augment_code_snippet>

Or from **backend directory**:

<augment_code_snippet mode="EXCERPT">
````bash
cd backend
node apiSmokeTest.js --base-url http://localhost:4000
````
</augment_code_snippet>

The script will print each test as `RUN`, followed by `OK` or `FAIL`, and a final summary.

### 2.3. Run tests against production backend

To verify the live deployment at `https://www.bahar.co.il/fantasybroker-api`:

From **repo root**:

<augment_code_snippet mode="EXCERPT">
````bash
node backend/apiSmokeTest.js --base-url https://www.bahar.co.il/fantasybroker-api
````
</augment_code_snippet>

Or from **backend directory**:

<augment_code_snippet mode="EXCERPT">
````bash
cd backend
node apiSmokeTest.js --base-url https://www.bahar.co.il/fantasybroker-api
````
</augment_code_snippet>

> Note: there must be a **space** between `--base-url` and the URL. The form `--base-url=https://...` is **not** currently parsed by the script.

### 2.4. Optional: full Google auth flow test

You can enable a test that exercises the full Google auth flow (valid token → user + backend JWT):

1. Obtain a **real Google ID token** (JWT) from your login flow (e.g., copy from browser DevTools).
2. Run the script with the token:

From **backend directory**:

<augment_code_snippet mode="EXCERPT">
````bash
cd backend
node apiSmokeTest.js \
  --base-url https://www.bahar.co.il/fantasybroker-api \
  --google-credential "<paste Google ID token here>"
````
</augment_code_snippet>

Alternatively, you can set environment variables:

- `API_BASE_URL` – default base URL if `--base-url` is omitted.
- `TEST_GOOGLE_CREDENTIAL` – default Google ID token for the auth happy-path test.

If no Google credential is provided, the `auth-google-valid-credential` test is **skipped** and reported as `SKIP`.

---

## 3. Extending the tests

When you add new backend endpoints (e.g. holdings, transactions):

1. **Add tests** in `backend/apiSmokeTest.js` (see its `tests` array and helper functions).
2. **Document each new test** in `backend/API_TESTS.md` (ID, endpoint, payload, and behavior checked).
3. Re-run the smoke tests against local and/or production to validate the new behavior.

This keeps your test module simple but powerful, and ensures every important endpoint has at least one automated check.

