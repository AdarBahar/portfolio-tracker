# Budget Management Specification

This document defines the requirements and database schema for the Budget Management feature. The system treats each user's virtual money like a bank account, tracking balances and maintaining a complete, immutable ledger of all changes.

---

## 1. Overview

The budget system manages:

* Each user's **current virtual balance**
* **Movements** of money in and out
* **Reasons** for the movements (win, loss, bonus, buy-in, etc.)
* **Counterparties** (house, another user, room pot)
* **Timestamps**, correlation IDs, and metadata for auditing

All balance updates must be atomic, consistent, and fully logged.

---

## 2. Core Concepts

### 2.1 User Budget

Each user has a wallet-like structure with:

* `available_balance` funds they can freely spend
* `locked_balance` funds reserved for pending operations
* `total_balance = available_balance + locked_balance`

### 2.2 System Accounts

The system may use its own logical accounts when money moves:

* `house` account (fees, rake)
* `room_pot` (optional) for buy-in holding
* `system` (internal automated operations)

### 2.3 Supported Operations

Typical budget operations include:

* Initial allocations (`INITIAL_GRANT`)
* Room entry (`ROOM_BUY_IN`)
* Room settlements (`ROOM_WIN_PAYOUT`, `ROOM_LOSS_SETTLEMENT`)
* Bonuses (`BONUS`) and reversals
* Adjustments (`ADJUSTMENT_CREDIT`, `ADJUSTMENT_DEBIT`)
* User-to-user transfers

Each operation must:

1. Validate conditions
2. Modify balances
3. Write an immutable budget log entry
4. Complete within a DB transaction

---

## 3. Requirements

### 3.1 Functional Requirements

* Every user has exactly one active budget record
* Every budget mutation must generate a log entry
* Balances can never go below zero
* Operations are atomic and idempotent
* Logs are append-only and never modified (soft delete allowed only for legal/exceptional cases)
* Ability to query user transaction history by time, room, season, type
* Ability for admins to add manual adjustments with metadata

### 3.2 Non-Functional Requirements

* Must scale for high-frequency budget operations
* Must support auditing and reconciliation
* Must prevent race conditions via row locks (`SELECT ... FOR UPDATE`) or optimistic locking
* Consistent rounding rules must be applied across all operations

---

## 4. Database Schema

Two primary tables:

* `user_budgets` (current state)
* `budget_logs` (immutable ledger)

### 4.1 `user_budgets`

**Purpose:** Track the user's current virtual money.

| Column              | Type          | Constraints                               | Description                   |
| ------------------- | ------------- | ----------------------------------------- | ----------------------------- |
| `id`                | INT           | PRIMARY KEY, AUTO_INCREMENT               | Unique ID                     |
| `user_id`           | INT           | UNIQUE, NOT NULL, FOREIGN KEY → users(id) | Owner of this budget          |
| `available_balance` | DECIMAL(18,2) | NOT NULL, DEFAULT 0                       | Funds freely available to use |
| `locked_balance`    | DECIMAL(18,2) | NOT NULL, DEFAULT 0                       | Pending reserved funds        |
| `currency`          | VARCHAR(10)   | NOT NULL, DEFAULT 'VUSD'                  | Virtual currency code         |
| `status`            | VARCHAR(20)   | NOT NULL, DEFAULT 'active'                | `active`, `frozen`, `closed`  |
| `created_at`        | DATETIME      | DEFAULT CURRENT_TIMESTAMP                 | Row creation time             |
| `updated_at`        | DATETIME      | ON UPDATE CURRENT_TIMESTAMP               | Last balance change           |
| `deleted_at`        | DATETIME      | NULL                                      | Soft delete timestamp         |

**Constraints:**

* `available_balance` must never be negative
* `locked_balance` must never be negative
* Exactly one record per user

**Indexes:**

* `idx_user_budgets_user_id`
* `idx_user_budgets_status`
* `idx_user_budgets_deleted_at`

---

### 4.2 `budget_logs`

**Purpose:** Immutable record of all wallet changes. Every balance update writes exactly 1 log entry.

| Column                 | Type          | Constraints                       | Description                                                         |
| ---------------------- | ------------- | --------------------------------- | ------------------------------------------------------------------- |
| `id`                   | INT           | PRIMARY KEY, AUTO_INCREMENT       | Log entry ID                                                        |
| `user_id`              | INT           | NOT NULL, FOREIGN KEY → users(id) | User whose budget changed                                           |
| `direction`            | VARCHAR(10)   | NOT NULL                          | `IN` or `OUT` relative to the user                                  |
| `operation_type`       | VARCHAR(50)   | NOT NULL                          | Type: `INITIAL_GRANT`, `ROOM_BUY_IN`, `BONUS`, `TRANSFER_OUT`, etc. |
| `amount`               | DECIMAL(18,2) | NOT NULL                          | Absolute change amount                                              |
| `currency`             | VARCHAR(10)   | NOT NULL, DEFAULT 'VUSD'          | Currency code                                                       |
| `balance_before`       | DECIMAL(18,2) | NOT NULL                          | User balance before operation                                       |
| `balance_after`        | DECIMAL(18,2) | NOT NULL                          | User balance after operation                                        |
| `bull_pen_id`          | INT           | NULL, FOREIGN KEY → bull_pens(id) | Optional room reference                                             |
| `season_id`            | INT           | NULL, FOREIGN KEY → seasons(id)   | Optional season reference                                           |
| `counterparty_user_id` | INT           | NULL, FOREIGN KEY → users(id)     | For transfers                                                       |
| `moved_from`           | VARCHAR(20)   | NULL                              | `system`, `user`, `house`, `room_pot`                               |
| `moved_to`             | VARCHAR(20)   | NULL                              | `system`, `user`, `house`, `room_pot`                               |
| `correlation_id`       | VARCHAR(64)   | NULL                              | Use to connect multi-entry operations                               |
| `idempotency_key`      | VARCHAR(64)   | NULL, UNIQUE                      | Prevent double-processing                                           |
| `created_by`           | VARCHAR(50)   | NOT NULL DEFAULT 'system'         | Who triggered the operation                                         |
| `meta`                 | JSON          | NULL                              | Extra details (campaign id, explanation, etc.)                      |
| `created_at`           | DATETIME      | DEFAULT CURRENT_TIMESTAMP         | Time of change                                                      |
| `deleted_at`           | DATETIME      | NULL                              | Soft delete timestamp                                               |

**Constraints:**

* `amount > 0`
* Logs may not be updated (append-only)
* `idempotency_key` must be unique when not NULL

**Indexes:**

* `(user_id, created_at)` for history queries
* `operation_type`
* `bull_pen_id`
* `season_id`
* `idempotency_key`
* `deleted_at`

---

## 5. Operation Flow (Required Pattern)

Every budget change must follow this sequence:

1. Start a DB transaction
2. Lock user’s budget row (`SELECT ... FOR UPDATE`)
3. Validate the operation

   * Enough available balance for debits
   * Budget status must be `active`
4. Compute `balance_before` and `balance_after`
5. Update `user_budgets`
6. Insert log row into `budget_logs`
7. Commit the transaction

All transfers (e.g. user-to-user) must:

* Lock **both** budgets
* Create **two** log entries with the same `correlation_id`

---

## 6. Summary

This specification establishes the full data and logic model for managing user budgets and financial transactions inside the platform. The design ensures:

* Strong consistency
* Full auditability
* Clear separation between current state and historical ledger
* Support for high-frequency virtual transactions

This document can now serve as the basis for API design and backend implementation.
