# API Test Suite for Portfolio Tracker Backend

This document describes the automated endpoint tests implemented in `backend/apiSmokeTest.js`.

Run the tests from your local machine while the backend is reachable (either locally or in production).

## How to run

- **Local backend (default API_BASE_PATH="")**

  ```bash
  node backend/apiSmokeTest.js --base-url=http://localhost:4000
  ```

- **Production backend (API_BASE_PATH=/fantasybroker-api)**

  ```bash
  node backend/apiSmokeTest.js --base-url=https://www.bahar.co.il/fantasybroker-api
  ```

- **List all registered tests (no network calls):**

  ```bash
  node backend/apiSmokeTest.js --list
  ```

- **Run full auth flow test with a real Google ID token (optional):**

  ```bash
  node backend/apiSmokeTest.js --base-url=http://localhost:4000 \
    --google-credential="<paste Google ID token here>"
  ```

You can also set environment variables instead of flags:

- `API_BASE_URL` – default base URL if `--base-url` is not provided.
- `TEST_GOOGLE_CREDENTIAL` – default Google ID token for the full auth test.

## Tested endpoints and logic

Each test has an **ID**, **endpoint**, and a short description of what is being verified.

### 1. `health-basic`

- **Endpoint:** `GET /api/health`
- **What is tested:**
  - API responds with **HTTP 200**.
  - Response body is JSON.
  - `status === "ok"`.
  - `db === "ok"` (confirms database connectivity via `SELECT 1`).

### 2. `openapi-available`

- **Endpoint:** `GET /api/openapi.json`
- **What is tested:**
  - API responds with **HTTP 200**.
  - Response body includes a `paths` object.
  - `paths` contains both `/api/health` and `/api/auth/google` entries.

### 3. `auth-google-missing-credential`

- **Endpoint:** `POST /api/auth/google`
- **Payload:** `{}` (empty JSON body).
- **What is tested:**
  - API responds with **HTTP 400**.
  - Response body is JSON with an `error` field.
  - `error` message contains `"Missing Google credential"`.

### 4. `auth-google-invalid-credential`

- **Endpoint:** `POST /api/auth/google`
- **Payload:** `{ "credential": "not-a-real-google-token" }`.
- **What is tested:**
  - API responds with **HTTP 401**.
  - Response body is JSON with an `error` field.
  - `error` message contains `"Invalid or expired Google token"`.

### 5. `auth-google-valid-credential` (optional)

- **Endpoint:** `POST /api/auth/google`
- **Payload:** `{ "credential": <real Google ID token> }`.
- **How to enable:**
  - Provide a real Google ID token via `--google-credential` or `TEST_GOOGLE_CREDENTIAL`.
  - If no token is provided, this test is **skipped**, and the runner will show it as `SKIP`.
- **What is tested:**
  - API responds with **HTTP 200**.
  - Response body is JSON with:
    - A `user` object containing at least `id` and `email`.
    - A non-empty `token` string (backend JWT).

## Extending the test suite

To add tests for new endpoints as the project evolves:

1. **Update `backend/apiSmokeTest.js`:**
   - Use `addTest(id, endpoint, description, run, { optional })` to register a new test.
   - Implement the `run(ctx)` function to call the endpoint and assert on:
     - HTTP status codes.
     - Response JSON shape and important fields.
     - Error shapes for invalid inputs.

2. **Document the new test here:**
   - Add a new section under "Tested endpoints and logic" with:
     - Test ID.
     - Endpoint and sample payload (if any).
     - Exactly what behavior is being verified.

3. **Keep error messages in sync:**
   - When you introduce new error paths in controllers, add tests that verify:
     - Correct HTTP status codes (400/401/403/404/500).
     - Error response shape `{ "error": "..." }`.

This setup is intentionally simple (plain Node.js, no external libraries) so you can run it from any machine with Node installed and grow the coverage alongside the API.

