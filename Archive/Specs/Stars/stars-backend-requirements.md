# Stars, Achievements, and Ranking Integration Specification

This document defines:

* The **decision and logic** for handling stars  
* The **Stars & Achievements model** (events, rules, processing)  
* How **stars plug into the existing ranking score** (room and global)

It builds on:

* `user_star_events` table (append-only log of star earnings)  
* Ranking mechanism (P\&L % \+ P\&L abs \+ stars → composite score)

---

## 1\. Design Decision: How Stars Behave

### 1.1 Role of Stars

Stars are a **meta progression** system over the user lifecycle:

* Reward successful actions and achievements  
* Encourage engagement and consistent play  
* Act as one input to the ranking score, alongside performance (P\&L)

### 1.2 Add-only Model

**Decision:** Stars are **add-only** in normal gameplay.

* Users **gain** stars for positive actions and achievements.

* Users **do not lose** stars for normal failures, room losses, or bad trades.

* Performance and failures are already captured via:

  * P\&L and return percentage  
  * Room results and ranking score  
  * Budget / wallet changes

This keeps stars intuitive (XP-like), avoids extra frustration, and focuses punishment on rank/returns instead of progress.

### 1.3 Progression and Pressure Without Star Loss

If we need competitive pressure or churn, we use:

* **Seasonal stars** vs **lifetime stars**

  * Lifetime stars: never decrease; used for profile / achievements.  
  * Seasonal stars: earned during a season; reset or compressed at season end for ranking.

* **Star impact on ranking**, not the raw count

  * We may apply decay or season resets to the *contribution* of stars in ranking, rather than modifying stored star counts.

---

## 2\. Stars & Achievements Model

### 2.1 Core Concepts

* **Star Event**: A single reason why a user earned stars.

  * Logged in `user_star_events` (append-only)  
  * Contains user, context (room/season), source, reason\_code, and stars\_delta

* **Achievement Rule**: A condition \+ reward pair.

  * Example: "3 straight wins" → `+40` stars  
  * Evaluated when game events occur (room finished, trade executed, etc.)

* **Aggregator**: A service/job that:

  * Computes current **per-room** stars and **per-season** stars from `user_star_events`  
  * Feeds these values into ranking calculations (`leaderboard_snapshots`, `season_user_stats`)

### 2.2 `user_star_events` Usage

Each star award is recorded as a row:

* `user_id` – recipient

* `bull_pen_id` – optional room context

* `season_id` – optional season context

* `source` – e.g. `achievement`, `prize`, `quest`, `admin_grant`

* `reason_code` – machine-readable identifier for the rule, e.g.:

  * `three_straight_wins`  
  * `room_first_place`  
  * `first_room_join`

* `stars_delta` – positive integer (stars earned)

* `meta` – JSON with details (room rank, payout, thresholds)

Stars are then aggregated by summing `stars_delta` over relevant scopes.

---

## 3\. Achievement Rules (Examples)

Below are initial rules. These should be configurable (DB table or config file) but behave conceptually as follows.

### 3.1 Gameplay Achievements

1. **3 straight wins**

   * **Condition:** User finishes in a "win" state (e.g. positive P\&L or top X%) in 3 consecutive rooms.  
   * **Reward:** `+40` stars.  
   * **reason\_code:** `three_straight_wins`  
   * **Trigger:** At room settlement; service checks streak history.

2. **Room first place**

   * **Condition:** User ranks 1st in a trading room.  
   * **Reward:** `+100` stars.  
   * **reason\_code:** `room_first_place`  
   * **Trigger:** At room settlement when ranking is finalized.

3. **First time joining a trading room**

   * **Condition:** User joins any room for the first time in their lifetime.  
   * **Reward:** `+10` stars.  
   * **reason\_code:** `first_room_join`  
   * **Trigger:** After successful `ROOM_BUY_IN` and room membership creation.

4. **Season top 10% finish** (global)

   * **Condition:** At season end, user is in the top 10% of global ranking.  
   * **Reward:** `+200` stars.  
   * **reason\_code:** `season_top_10_percent`  
   * **Trigger:** After season rankings are finalized.

5. **Season top 100 finish** (global)

   * **Condition:** User is in the top 100 users of a season.  
   * **Reward:** `+300` stars.  
   * **reason\_code:** `season_top_100`  
   * **Trigger:** After season rankings are finalized.

### 3.2 Engagement Achievements

6. **X rooms played**

   * **Condition:** User has joined N rooms in lifetime (e.g. 10, 50, 100).  
   * **Reward:** scaled stars (`+20`, `+60`, `+150`, ...).  
   * **reason\_code:** `rooms_played_milestone_N`

7. **Login streaks / activity streaks** (optional)

   * **Condition:** Logged in / traded for N consecutive days.  
   * **Reward:** small recurring star bonuses.  
   * **reason\_code:** `activity_streak_N`

### 3.3 Admin & Special Grants

8. **Admin grant**

   * **Condition:** Manual grant by admin.  
   * **Reward:** arbitrary star amount.  
   * **reason\_code:** `admin_grant`

9. **Campaign / promotion**

   * **Condition:** User completes campaign-specific action.  
   * **Reward:** defined by campaign.  
   * **reason\_code:** `campaign_<code>`

---

## 4\. Achievement Evaluation Flow

### 4.1 Event-Driven Approach

For each key event:

* Room joined  
* Room settled  
* Season ended  
* Milestones reached (count of rooms, wins, etc.)

The game logic publishes a **domain event**, for example:

* `room.joined(user_id, bull_pen_id)`  
* `room.settled(user_id, bull_pen_id, rank, pnl_pct)`  
* `season.ended(season_id)`

An **Achievements service** or component then:

1. Evaluates all relevant achievement rules for that event

2. For each rule that qualifies:

   * Writes a new `user_star_events` row  
   * Optionally notifies the user (popup / toast / notification)

All star writes must be idempotent per rule and user, using a deterministic `reason_code` \+ context (and optionally a `correlation_id`).

### 4.2 Idempotency

To avoid granting stars twice:

* Before inserting a `user_star_events` row, check if a row already exists for:

  * `user_id`  
  * `reason_code`  
  * Context (e.g. `bull_pen_id` or `season_id`)

* If it exists, skip creation.

---

## 5\. Aggregation Logic for Stars

### 5.1 Per-Room Stars

Definition:

room\_stars(user, room) \=

  SUM(stars\_delta)

  WHERE user\_id \= user

    AND bull\_pen\_id \= room

    AND deleted\_at IS NULL

Usage:

* Used for **room-level ranking** contribution.

### 5.2 Seasonal Stars

Definition:

season\_stars(user, season) \=

  SUM(stars\_delta)

  WHERE user\_id \= user

    AND season\_id \= season

    AND deleted\_at IS NULL

Usage:

* Used for **global (season) ranking** contribution.

### 5.3 Lifetime Stars

Definition:

lifetime\_stars(user) \=

  SUM(stars\_delta)

  WHERE user\_id \= user

    AND deleted\_at IS NULL

Usage:

* Profile display  
* Long-term achievements  
* Optional gating for higher-tier rooms or modes

---

## 6\. Plugging Stars into Ranking Score

The ranking score is a composite of:

* Return percentage  
* Absolute P\&L  
* Stars (room or season)

### 6.1 Normalization

For each ranking cohort (room or season), we normalize metrics to \[0,1\]:

Let:

* `room_return_pct(user)` \= room-level return percentage  
* `room_pnl(user)` \= room-level absolute P\&L  
* `room_stars(user)` \= room-level star count (from aggregation above)

Compute:

norm\_return\_pct(user) \=

  if max\_return \== min\_return:

    0.5

  else:

    (room\_return\_pct(user) \- min\_return) / (max\_return \- min\_return)

norm\_pnl(user) \=

  if max\_pnl \== min\_pnl:

    0.5

  else:

    (room\_pnl(user) \- min\_pnl) / (max\_pnl \- min\_pnl)

norm\_stars(user) \=

  if max\_stars \== min\_stars:

    0.5

  else:

    (room\_stars(user) \- min\_stars) / (max\_stars \- min\_stars)

The same shape applies for **seasonal/global ranking**, replacing room metrics with seasonal equivalents (`season_return_pct`, `season_pnl`, `season_stars`).

### 6.2 Composite Score Formula

Room-level score (`room_score`) and season-level score (`global_score`) use the same structure:

score(user) \=

  w\_return \* norm\_return\_pct(user) \+

  w\_pnl    \* norm\_pnl(user) \+

  w\_stars  \* norm\_stars(user)

Suggested default weights:

* `w_return = 0.5` (performance efficiency)  
* `w_pnl    = 0.2` (absolute profit/size)  
* `w_stars  = 0.3` (engagement/achievements)

These can be tuned per season or room type.

### 6.3 Data Flow Integration

**Per-room ranking**

1. Aggregation job computes per-room:

   * `room_pnl`, `room_return_pct` (from trading results)  
   * `room_stars` (from `user_star_events`)

2. Normalize metrics within that room.

3. Compute `room_score` for each user.

4. Store results into `leaderboard_snapshots`:

   * `pnl_abs`, `pnl_pct`, `stars`, `score`

**Season/global ranking**

1. `season_user_stats` maintains per-user, per-season aggregates:

   * `total_initial_equity`, `total_portfolio_value` → `pnl_abs`, `pnl_pct`  
   * `stars` \= `season_stars(user, season)`

2. Periodic job normalizes metrics across all users in the season and computes `score`.

3. `season_user_stats.score` is then used for global leaderboard reads.

---

## 7\. Tie-breaking with Stars

When two users have very similar composite scores, additional tie-breakers apply:

1. Higher return percentage  
2. Higher absolute P\&L  
3. Higher stars  
4. Higher trade count  
5. Earlier account creation

Stars act as a **third-level differentiator** after raw performance.

---

## 8\. Achievement Rules Configuration – Database Design

To make achievements and star rewards configurable without code changes, we introduce a dedicated table for rules.

### 8.1 `achievement_rules`

**Purpose:**

Store all configurable achievement rules that can grant stars when conditions are met.

| Column | Type | Constraints | Description |
| :---- | :---- | :---- | :---- |
| `id` | INT | PRIMARY KEY, AUTO\_INCREMENT | Rule ID |
| `code` | VARCHAR(100) | UNIQUE, NOT NULL | Machine-readable identifier (e.g. `three_straight_wins`, `room_first_place`) |
| `name` | VARCHAR(150) | NOT NULL | Human-readable name (e.g. "3 Straight Wins") |
| `description` | TEXT | NULL | Description shown in UI or admin panel |
| `category` | VARCHAR(50) | NOT NULL | Category: `performance`, `engagement`, `seasonal`, `admin`, `campaign`, etc. |
| `source` | VARCHAR(50) | NOT NULL | Logical issuer: `achievement`, `prize`, `quest`, `campaign`, `admin` |
| `stars_reward` | INT | NOT NULL | Number of stars granted when this rule fires |
| `is_repeatable` | TINYINT(1) | NOT NULL, DEFAULT 0 | 0 \= one-time, 1 \= can be earned multiple times |
| `max_times` | INT | NULL | Max number of times the user can earn this rule (NULL \= unlimited if repeatable) |
| `scope_type` | VARCHAR(30) | NOT NULL | `room`, `season`, `lifetime`, `campaign`, etc. |
| `is_active` | TINYINT(1) | NOT NULL, DEFAULT 1 | Soft toggle for rule activation |
| `conditions_json` | JSON | NULL | JSON config describing the rule conditions (thresholds, streak count, rank cutoff, etc.) |
| `ui_badge_code` | VARCHAR(100) | NULL | Optional badge/asset key for the front-end |
| `created_at` | DATETIME | DEFAULT CURRENT\_TIMESTAMP | Creation time |
| `updated_at` | DATETIME | ON UPDATE CURRENT\_TIMESTAMP | Last update time |
| `deleted_at` | DATETIME | NULL | Soft delete timestamp |

**Examples:**

* `code = 'three_straight_wins'`

  * `category = 'performance'`  
  * `source = 'achievement'`  
  * `stars_reward = 40`  
  * `is_repeatable = 1`, `max_times = NULL` (can be earned multiple times)  
  * `scope_type = 'room'`  
  * `conditions_json` might store:

  {

    "required\_consecutive\_wins": 3,

    "min\_rooms\_size": 1

  }

* `code = 'room_first_place'`

  * `category = 'performance'`  
  * `source = 'achievement'`  
  * `stars_reward = 100`  
  * `is_repeatable = 1`  
  * `scope_type = 'room'`  
  * `conditions_json`:

  {

    "required\_rank": 1

  }

* `code = 'first_room_join'`

  * `category = 'engagement'`  
  * `source = 'achievement'`  
  * `stars_reward = 10`  
  * `is_repeatable = 0`  
  * `scope_type = 'lifetime'`

### 8.2 Using `achievement_rules` in the Achievements Service

1. On startup, the Achievements service loads **active** rules:

   * `SELECT * FROM achievement_rules WHERE is_active = 1 AND deleted_at IS NULL`

2. When a domain event occurs (room joined, room settled, season ended, etc.):

   * Filter relevant rules by `scope_type` and `category`.

   * For each candidate rule:

     * Evaluate `conditions_json` against the current context (rank, streak, number of rooms, etc.).

     * Check whether the rule is:

       * One-time (`is_repeatable = 0`) and already awarded for this user, or  
       * Repeatable but `max_times` reached.

3. When a rule qualifies:

   * Insert into `user_star_events` with:

     * `source = achievement_rules.source`  
     * `reason_code = achievement_rules.code`  
     * `stars_delta = achievement_rules.stars_reward`  
     * `meta` including any runtime details.

4. Admins can manage rules via an internal UI:

   * Add new rules (new achievements and campaigns)  
   * Adjust `stars_reward`  
   * Toggle `is_active`  
   * Soft delete with `deleted_at` if deprecated

This design allows new achievements and star rewards to be launched or tuned without code changes.

---

## 9\. Summary

* Stars are **add-only** and represent positive progression.  
* `achievement_rules` makes star-earning logic **configurable** and **data-driven**.  
* Achievements service evaluates rules against domain events and writes to `user_star_events`.  
* Aggregated stars feed into the ranking score alongside performance metrics.

This completes the core data model and behavior for Stars & Achievements.

* Stars are **add-only** and represent positive progression.  
* Achievements and game events create **star events** in `user_star_events`.  
* Stars are aggregated per room, per season, and per lifetime.  
* Normalized star counts feed into the ranking score alongside P\&L metrics.  
* Seasonal/lifetime separation allows competitive ladders without erasing long-term progress.

This spec can now be used to implement:

* The Achievements service logic  
* Star awarding hooks in trading and season flows  
* Leaderboard integration that fairly combines performance and achievements.
