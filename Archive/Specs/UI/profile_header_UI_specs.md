# Profile Header UI Specification

This document defines the user dashboard header shown immediately after login. The header provides a quick overview of the user’s identity, performance, season status, and game engagement.

---

## 1\. Purpose

The profile header serves as the user’s primary at-a-glance summary:

* Who they are (identity)  
* How they are doing (ranking \+ profit)  
* How active they are (rooms, wins, streaks)  
* What they can do next (actions)

It acts as the top section of the user dashboard.

---

## 2\. Structure Overview

The header is divided into three core blocks:

### 2.1 Identity Block (Left)

* Profile image  
* Full name  
* Username  
* Lifetime stars (badge)  
* Tier / Level (optional)  
* Net profit (lifetime P\&L)  
* Season info (optional)

### 2.2 Stats Block (Center)

Key performance and engagement metrics:

* Global Rank  
* Win Rate  
* Total Rooms Played  
* Total Wins  
* Season Rank (if seasons active)  
* Streaks (win streak / activity streak)

### 2.3 Actions Block (Right)

Primary actions:

* Join Room  
* Create Room  
* My Rooms  
* View Full Stats (optional)

---

## 3\. Identity Block Details

### 3.1 Profile Image

* Circular avatar  
* Default placeholder for new users

### 3.2 Name & Username

* Large name text  
* Smaller @username text below

### 3.3 Stars Badge

* Shows total lifetime stars  
* Circular or hex badge for visibility  
* Color-coded (purple/blue recommended)

### 3.4 Tier / Level (Optional)

* Example: Silver, Gold, Platinum  
* Or: Level 12 (based on stars)  
* Positioned near stars badge

### 3.5 Net Profit (Lifetime P\&L)

* Displayed as:

  * **Net Profit: \+$125,430**

* Green for profit, red for loss

* Tooltip explaining how net profit is calculated

### 3.6 Season Info (Optional)

If seasons are active:

* Current Season: "Season 1"  
* Season Ends In: "12 days"  
* Season Stars / Season Score preview

---

## 4\. Stats Block Details

Displays key stats in equal-sized cards.

### 4.1 Global Rank

* Trophy icon  
* Format: **\#156**  
* If rising or falling, show small trend arrow

### 4.2 Win Rate

* Arrow-up icon  
* Format: **59.8%**  
* Color-coded green for \>50%, neutral otherwise

### 4.3 Total Rooms

* Target icon  
* Format: **87**

### 4.4 Total Wins

* Ribbon/award icon  
* Format: **52**

### 4.5 Optional Stats

If needed:

* Best room result  
* Average return  
* Risk level (low/medium/high)  
* Most traded asset type

### 4.6 Optional Season Stats

If seasons exist:

* Season Rank  
* Season Stars  
* Season Score

---

## 5\. Actions Block Details

### Primary Actions

* **Join Room** (primary button)  
* **Create Room** (secondary button)  
* **My Rooms** (link or button)

### Optional Actions

* **View Full Stats** (deep dive profile page)  
* **Achievements** (badge overview)

Buttons should be right-aligned on large screens.

---

## 6\. Enhanced Indicators (Optional but Recommended)

### 6.1 Trends

* Profit last 7 days (arrow up/down)  
* Rank movement ("↑ 12 this week")  
* Win rate trend

### 6.2 Highlights

* Achievement unlocked recently  
* Last room played summary

### 6.3 Season Highlights

* Position relative to season thresholds  
* "You are 30 points away from Top 100\!"

---

## 7\. Empty State (New User)

When the user has no history, revenue, wins, or rooms played.

### 7.1 Identity Block

* Placeholder avatar  
* Name \+ username  
* Stars: **0**  
* Net Profit: **$0.00** (Start your first room to earn profit)  
* Tier: "Unranked"

### 7.2 Stats Block

| Stat | Value |
| :---- | :---- |
| Global Rank | **—** |
| Win Rate | **—** |
| Total Rooms | **0** |
| Total Wins | **0** |
| Streaks | **0** |

### 7.3 Callouts

* "Welcome\! Your stats will appear here after your first room."  
* "Join your first room to start earning stars and ranking points."

### 7.4 Incentive

* Small hint: **"⭐ Earn 10 stars when you join your first room"**

### 7.5 Action Block

* Highlight **Join Room** button  
* De-emphasize Create Room until user has experience

---

## 8\. Visual & UX Guidelines

### • Layout

* Three-column layout (left identity, center stats, right actions)  
* Responsive stacking on mobile

### • Colors

* Profit/loss: green/red  
* Stars: purple/blue  
* Season: accent color  
* Rank badges: gold/silver/bronze

### • Typography

* Name: large  
* Metrics: medium-bold  
* Labels: small and subtle

### • Interactions

* Hover states for cards  
* Tooltips for explanations  
* Smooth transitions when stats update

---

## 10\. Profile Image Upload Behavior

### 10.1 Avatar With Camera Icon

* The avatar component shows:

  * Current profile image (if available)  
  * Otherwise a gradient placeholder with user initial  
  * A **camera icon** positioned bottom-right

* Clicking the camera icon triggers **image upload** modal

* Supported behaviors:

  * Upload new image  
  * Preview before saving  
  * Auto-crop to square  
  * Auto-center and zoom controls (optional)  
  * Save or cancel

### 10.2 Mobile Behavior

* Camera icon scaled down  
* Avatar acts as the trigger (tap anywhere)

### 10.3 Upload Constraints

* Allowed formats: JPG, PNG, WEBP  
* Max size: 2–5MB  
* Recommended size: 512x512  
* Show upload progress state if needed

---

## 11\. Component-Level Breakdown

This section defines reusable components powering the Profile Header UI.

### 11.1 Avatar Component

**Purpose:** Display user image with upload affordance.

**Elements:**

* Image or placeholder  
* Camera icon overlay  
* Optional tier ring or glow

**States:**

* Default  
* Hover (desktop): slight scale \+ shadow  
* Upload-hover: camera icon brightens  
* Loading: spinner overlay

**Props:**

* `src`  
* `size` (sm/md/lg)  
* `editable` (bool)  
* `onUpload()` callback

---

### 11.2 StatCard Component

**Purpose:** Display a single numeric metric.

**Elements:**

* Icon (trophy, target, arrow, etc.)  
* Label (Global Rank, Win Rate, etc.)  
* Value (large)  
* Optional trend arrow

**States:**

* Default  
* Hover: slight elevation  
* Loading: skeleton text

**Props:**

* `icon`  
* `label`  
* `value`  
* `trend` (up/down/none)  
* `color` override

---

### 11.3 StarBadge Component

**Purpose:** Show lifetime stars, season stars, or level.

**Elements:**

* Circular or hex container  
* Star icon  
* Numeric value

**States:**

* Default  
* Animated when stars increase (+ripple)

**Props:**

* `value`  
* `size`  
* `colorScheme`  
* `animated`

---

### 11.4 ProfitIndicator Component

**Purpose:** Show lifetime net profit or seasonal profit.

**Elements:**

* Dollar icon or trending line icon  
* Value shown as **\+$125,430** or **\-$2,130**  
* Color-coded: green/red

**States:**

* Default  
* Animated counter when value changes

**Props:**

* `amount`  
* `currency`  
* `animated`

---

## 12\. Dark/Light Mode Variants

### 12.1 Colors

| Element | Light Mode | Dark Mode |
| :---- | :---- | :---- |
| Background | \#FFFFFF | \#0D1117 / \#111827 |
| Cards | \#F7F8FA | \#1A1F27 |
| Text (primary) | \#0A0A0A | \#FFFFFF |
| Text (secondary) | \#5F6B7A | \#A3ADC2 |
| Borders | \#E4E5E8 | \#1F2937 |
| Profit-green | \#0FAF55 | \#4ADE80 |
| Loss-red | \#E11D48 | \#FB7185 |
| Stars-purple | \#6C2BD9 | \#A78BFA |

### 12.2 Component Adaptation

* Avatar shadow reduces in dark mode  
* Icons switch between filled vs outline for contrast  
* StatCards use slightly stronger borders in light mode

---

## 13\. Animation & Micro-Interactions

### 13.1 Rank Movement Animation

* When rank improves:

  * Quick upward slide of value  
  * Green "↑" indicator pulses once

* When rank drops:

  * Downward slide  
  * Red "↓" indicator

* Duration: 200–300ms

* Easing: `cubic-bezier(0.4, 0, 0.2, 1)`

### 13.2 Earnings Counter Animation

* ProfitIndicator counts up from previous value to new value  
* Easing duration: 400–600ms  
* Optional sparkle effect when profit is positive

### 13.3 Streak Glow

* Win streak badge gets soft pulsing glow  
* Color: yellow/orange  
* Pulse rate: slow (2s) to avoid distraction

### 13.4 Star Earned Animation

* When user receives stars:

  * StarBadge scales from 0.95 → 1.05 → 1.00  
  * Optional particle burst of small stars

* Duration: 300–400ms

---

## 14\. Figma-Ready Layout Guidelines

### 14.1 Artboard & Grid

* Desktop frame: **1440px width**, grid **12 columns**, 80px margins  
* Mobile frame: **375px width**, 4 columns

### 14.2 Header Container

* Full-width card  
* Padding: **24–32px**  
* Border radius: **16px**  
* Shadow (light mode): soft 8–12px  
* Shadow (dark mode): subtle 4–8px

### 14.3 Identity Block Layout

* Avatar: 72–92px  
* Spacing between avatar & text: 16px  
* Name: 20–22px semibold  
* Username: 14–16px medium  
* Profit: 16px bold  
* Stars badge: near avatar or next to username  
* Support 2-row layout on narrow screens

### 14.4 Stats Block Layout

* Use 4 equal cards horizontally  
* Card size: \~160–200px width each  
* Padding: 16–20px  
* Value: 20–24px bold  
* Label: 12–14px secondary text  
* Icon: 16–20px

### 14.5 Actions Block Layout

* Buttons aligned right on desktop  
* Join button: primary color  
* Create button: secondary color  
* Spacing between buttons: 12–16px  
* Mobile: stack actions vertically

### 14.6 Interaction & Hover Guides

* Cards lift by 2–3px on hover  
* Avatar shows camera overlay on hover  
* Buttons animate with 0.15–0.2s ease-in-out

---

## 15\. Updated Summary

* Added avatar upload flow with camera icon  
* Added component library breakdown (Avatar, StatCard, StarBadge, ProfitIndicator)  
* Added dark/light mode variants  
* Added animations for rank, profit, streaks, and stars  
* Added Figma-ready design rules

This covers all elements required for production design, frontend implementation, and handoff to design/engineering teams.

The Profile Header UI presents:

* Core performance and identity  
* Key metrics for ranking and engagement  
* Season and achievement context  
* Clear actions to continue playing

The empty state ensures new users see a clean, motivational, and uncluttered header that guides them into their first game.

This header serves as the foundational component for the user dashboard experience.

More actions:

Component JSX/React code  
Motion specs in Lottie / CSS  
A mobile-optimized version of the header  
Additional gamification elements (levels, badges, streak systems)
