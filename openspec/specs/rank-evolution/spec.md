# rank-evolution Specification

## Purpose

Show each cryptocurrency's rank evolution compared to the previous week, using a daily rank snapshot stored in localStorage.

## Context

The app assigns a synthetic `display_rank` to each coin after stablecoin removal (`App.jsx:190`). This rank is based on market cap ordering. Currently there is no rank history.

## Requirements

### Requirement: Daily rank snapshot

The system SHALL store a daily snapshot of all crypto rankings in localStorage.

#### Scenario: First visit of the day

- GIVEN the user opens the app
- WHEN `loadData()` completes and today's date differs from `rankSnapshotDate`
- THEN the current `display_rank` of each coin (keyed by `id`) is saved to `rankHistory`
- AND `rankSnapshotDate` is updated to today

#### Scenario: Same day, multiple refreshes

- GIVEN the user already visited the app today
- WHEN `loadData()` completes
- THEN the rank snapshot is NOT overwritten (preserves morning snapshot)

#### Scenario: localStorage empty

- GIVEN `rankHistory` does not exist in localStorage
- WHEN the app loads
- THEN `rankHistory` is initialized as `{}`

### Requirement: Rank comparison data

The system SHALL compute rank evolution by comparing current rank with the snapshot from ~7 days ago.

#### Scenario: Rank improved

- GIVEN a coin's current `display_rank` is 3
- AND its rank 7 days ago was 5
- THEN the evolution is +2 (improved by 2 positions)

#### Scenario: Rank dropped

- GIVEN a coin's current `display_rank` is 7
- AND its rank 7 days ago was 4
- THEN the evolution is -3 (dropped 3 positions)

#### Scenario: No previous data

- GIVEN a coin has no rank entry from 7 days ago
- WHEN evolution is computed
- THEN evolution is `null` (no badge displayed)

#### Scenario: New coin not in previous snapshot

- GIVEN a coin was not in the top 50 last week
- WHEN evolution is computed
- THEN evolution is `null`

### Requirement: Visual display on crypto card

The system SHALL display a rank evolution badge on each CryptoCard.

#### Scenario: Rank improved

- GIVEN a coin improved its rank
- WHEN the card is rendered
- THEN a green upward arrow with the number of positions is shown (e.g. `▲2`)

#### Scenario: Rank dropped

- GIVEN a coin dropped in rank
- WHEN the card is rendered
- THEN a red downward arrow with the number of positions is shown (e.g. `▼3`)

#### Scenario: Rank unchanged

- GIVEN a coin's rank is the same as 7 days ago
- WHEN the card is rendered
- THEN a neutral indicator is shown (e.g. `—`)

#### Scenario: No data

- GIVEN evolution is `null`
- WHEN the card is rendered
- THEN no evolution badge is displayed

### Requirement: localStorage keys

The system SHALL use the following new localStorage keys:

| Key                | Type                     | Description                         |
| ------------------ | ------------------------ | ----------------------------------- |
| `rankHistory`      | `JSON.stringify(Object)` | `{ coinId: rank }` — daily snapshot |
| `rankSnapshotDate` | `Date.toDateString()`    | Date of last rank snapshot          |

### Requirement: One week retention

The system SHALL keep rank data for at least 7 days, maximum 10 days.

#### Scenario: Single snapshot strategy

- GIVEN only ONE snapshot is stored (`rankHistory`)
- WHEN a new daily snapshot is saved
- THEN the previous snapshot is overwritten
- AND the comparison uses the single stored snapshot

#### Scenario: Data older than 10 days

- GIVEN `rankSnapshotDate` is more than 10 days old
- WHEN the app loads
- THEN the old snapshot is cleared
- AND no evolution badge is shown until a new snapshot is stored

## Implementation Plan

### Step 1: Add localStorage keys in App.jsx

- Add `rankHistory` state (init from localStorage, default `{}`)
- Add `rankSnapshotDate` state (init from localStorage, default `''`)
- Add useEffect to persist both to localStorage

### Step 2: Save daily snapshot in loadData()

- After `setCryptos(withRank)`, check if today differs from `rankSnapshotDate`
- If different: build `{ coin.id: coin.display_rank }` from `withRank`
- Save to `rankHistory` and update `rankSnapshotDate`

### Step 3: Compute evolution in CryptoCard

- Pass `rankHistory` as prop from App → CryptoGrid → CryptoCard
- In CryptoCard: compare `coin.display_rank` with `rankHistory[coin.id]`
- Compute delta: `previousRank - currentRank` (positive = improved)

### Step 4: Add evolution badge CSS

- `.rank-evolution` container
- `.rank-up` (green, ▲)
- `.rank-down` (red, ▼)
- `.rank-stable` (gray, —)

### Step 5: Update tests

- Unit test for rank snapshot logic
- Unit test for evolution computation
- CryptoCard test for evolution badge rendering
