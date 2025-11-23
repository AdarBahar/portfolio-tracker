# Frontend edit/delete wiring – plan and next steps

## Scope

Wire the existing backend CRUD APIs (PUT/DELETE for holdings, dividends, transactions) into the frontend so users can edit and delete items from the UI, in both API and demo (localStorage-only) modes.

## 1. Data layer (ApiAdapter / DataService)

- Fix `ApiAdapter.saveHoldings` structure in `scripts/dataService.js`:
  - Ensure `saveHoldings` is properly closed.
  - Move `updateHolding` and `deleteHolding` out to be normal class methods.
- Implement explicit edit/delete methods on `ApiAdapter`:
  - `async updateHolding(holding)` → `PUT /api/holdings/:id`.
  - `async deleteHolding(id)` → `DELETE /api/holdings/:id`.
  - `async updateDividend(dividend)` → `PUT /api/dividends/:id`.
  - `async deleteDividend(id)` → `DELETE /api/dividends/:id`.
  - `async updateTransaction(tx)` → `PUT /api/transactions/:id`.
  - `async deleteTransaction(id)` → `DELETE /api/transactions/:id`.
- Each method should:
  - Require `id`.
  - Map field names to what the backend expects.
  - On success, keep local copies in sync (either update mirrors immediately or rely on the next `saveAll`/reload).
- Decide how `AppState` calls into this layer:
  - Either call `state.dataService.adapter.updateHolding(...)` directly, or
  - Add corresponding helpers on `DataService` (e.g. `updateHolding`, `deleteHolding`, etc.).
- Ensure `LocalStorageAdapter` continues to work:
  - In demo mode, updates and deletes should only touch localStorage, with no API calls.

## 2. Application state (AppState in scripts/state.js)

Add high-level methods so the UI can work in a mode-agnostic way:

- Holdings:
  - `async updateHolding(updatedHolding)`.
  - `async deleteHolding(id)`.
- Dividends:
  - `async updateDividend(updatedDividend)`.
  - `async deleteDividend(id)`.
- Transactions:
  - `async updateTransaction(updatedTransaction)`.
  - `async deleteTransaction(id)`.

Each method should:

- Update the relevant in-memory array by `id`.
- For holdings edits/deletes, maintain derived state:
  - If ticker changes, re-init price/trend for the new ticker and clean up the old one.
  - On delete, remove entries for that ticker from `currentPrices`, `previousPrices`, and `trendData`.
- Call `await this.save()` so `DataService` persists via API or localStorage.
- Call `this.notify()` so subscribers (UI) re-render.

## 3. UI markup (index.html)

- Holdings table:
  - Add an **Actions** column header to the holdings table (e.g., at the end).
- Transactions table:
  - Add an **Actions** column header to the transactions table.
- (Optional later) Decide whether dividends need visible edit/delete controls and where they live.

## 4. UI rendering (scripts/ui.js)

- `updateHoldingsTable(state)`:
  - Add an actions `<td>` per row with:
    - `button.edit-holding-btn` with `data-id`.
    - `button.delete-holding-btn` with `data-id`.
  - Include accessible labels (`aria-label` with ticker).
- `updateTransactions(state)`:
  - Add an actions `<td>` per row with:
    - `button.edit-transaction-btn` with `data-id`.
    - `button.delete-transaction-btn` with `data-id`.

## 5. Modals and event wiring

- Reuse the existing **Add Position** modal for **Edit Position**:
  - When clicking an `edit-holding-btn`:
    - Look up the holding by `id` from `state.holdings`.
    - Pre-fill the modal fields (ticker, company, shares, purchase price/date, sector, asset class).
    - Mark the modal as `mode = "edit"` and store the `id` (e.g., on the form dataset).
    - Change modal title/button text to indicate editing.
  - On form submit:
    - If `mode === "add"`, keep existing behavior (add holding + transaction).
    - If `mode === "edit"`, call `state.updateHolding(...)` instead (no new transaction).
- For deletes:
  - On `delete-holding-btn` click:
    - Confirm (`window.confirm` is fine initially).
    - On confirm, call `state.deleteHolding(id)` and show a toast.
  - Mirror the same pattern for `edit-transaction-btn` / `delete-transaction-btn` using `state.updateTransaction` / `state.deleteTransaction`.
- Central event wiring:
  - Use event delegation (e.g., `document.addEventListener('click', ...)`) to catch clicks on the new action buttons.
  - Hook into `AppState` and modal helpers from `scripts/app.js` or a small interaction helper.

## 6. Behavior across modes

Verify the same UI flows behave correctly in both modes:

- **API mode** (non-demo user with token and `config.apiUrl`):
  - Initial load uses `GET /api/portfolio/all`.
  - Editing/deleting holdings/transactions sends `PUT`/`DELETE` to `/api/holdings/:id` and `/api/transactions/:id`.
  - Changes persist on reload.
- **Demo mode** (demo user or no API config/token):
  - No network calls for edit/delete.
  - All data changes are localStorage only and persist across reloads.

## 7. Definition of done

This task is done when:

- From the UI, a user can edit and delete at least **holdings and transactions** via visible buttons.
- After these actions, tables, metrics, charts, and trend data reflect the new state.
- In API mode, the correct backend endpoints are called and state stays consistent on reload.
- In demo mode, everything works with localStorage only.
- Existing backend smoke tests still pass (and any additional holdings CRUD test, if added, also passes).

