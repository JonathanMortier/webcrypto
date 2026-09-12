# rank-evolution Specification

## Purpose

Show each cryptocurrency's rank evolution over a rolling month, using one daily rank snapshot per day stored in localStorage.

## Context

The app assigns a synthetic `display_rank` to each coin after stablecoin removal. This rank is based on market cap ordering. The system keeps a dated history of daily snapshots so the evolution can be computed between the current snapshot and the oldest snapshot still retained.

## Requirements

### Requirement: Daily rank snapshot

The system SHALL store at most one rank snapshot per calendar day.

#### Scenario: First visit of the day

- GIVEN the user opens the app
- WHEN `loadData()` completes and today's date differs from `rankSnapshotDate`
- THEN a new snapshot `{ coinId: display_rank }` is recorded under today's date key in `rankHistory`
- AND `rankSnapshotDate` is updated to today

#### Scenario: Same day, multiple refreshes

- GIVEN a snapshot already exists for today
- WHEN `loadData()` completes
- THEN today's snapshot is NOT overwritten (preserves first snapshot of the day)

#### Scenario: localStorage empty

- GIVEN `rankHistory` does not exist in localStorage
- WHEN the app loads
- THEN `rankHistory` is initialized as `{}`

### Requirement: Rolling one-month retention

The system SHALL keep rank snapshots for up to 30 days (`RANK_HISTORY_MAX_AGE_DAYS`).

#### Scenario: Prune older snapshots

- GIVEN `rankHistory` contains a snapshot older than 30 days
- WHEN `loadData()` runs
- THEN snapshots dated before the 30-day cutoff are removed

#### Scenario: Recent snapshots kept

- GIVEN `rankHistory` contains snapshots within the last 30 days
- WHEN `loadData()` runs
- THEN recent snapshots are kept and used for evolution computation

#### Scenario: Legacy single-snapshot format

- GIVEN localStorage contains the old flat format `{ coinId: rank }`
- WHEN `rankHistory` is initialized
- THEN the data is migrated to a dated snapshot under the last known `rankSnapshotDate`

### Requirement: Rank comparison data

The system SHALL compute rank evolution by comparing the current snapshot with the oldest snapshot retained for a coin.

#### Scenario: Rank improved over the month

- GIVEN a coin's current snapshot rank is 3
- AND its oldest retained rank was 5
- THEN the evolution is +2 (improved by 2 positions)

#### Scenario: Rank dropped over the month

- GIVEN a coin's current snapshot rank is 7
- AND its oldest retained rank was 4
- THEN the evolution is -3 (dropped 3 positions)

#### Scenario: No data

- GIVEN a coin has fewer than two snapshots in `rankHistory`
- WHEN evolution is computed
- THEN evolution is `null` (no badge displayed)

#### Scenario: New coin not in previous snapshots

- GIVEN a coin was not in the top 50 in any previous snapshot
- WHEN evolution is computed
- THEN evolution is `null`

### Requirement: Visual display on crypto card

The system SHALL display a rank evolution badge on each CryptoCard.

#### Scenario: Rank improved

- GIVEN a coin improved its rank over the month
- WHEN the card is rendered
- THEN a green upward arrow with the number of positions is shown (e.g. `▲2`)

#### Scenario: Rank dropped

- GIVEN a coin dropped in rank over the month
- WHEN the card is rendered
- THEN a red downward arrow with the number of positions is shown (e.g. `▼3`)

#### Scenario: Rank unchanged

- GIVEN a coin's rank is the same over the month
- WHEN the card is rendered
- THEN a neutral indicator is shown (e.g. `—`)

#### Scenario: No data

- GIVEN evolution is `null`
- WHEN the card is rendered
- THEN no evolution badge is displayed

### Requirement: localStorage keys

The system SHALL use the following localStorage keys:

| Key                | Type                     | Description                                       |
| ------------------ | ------------------------ | ------------------------------------------------- |
| `rankHistory`      | `JSON.stringify(Object)` | `{ dateKey: { coinId: rank } }` — daily snapshots |
| `rankSnapshotDate` | `YYYY-MM-DD`             | Date key of the last recorded daily snapshot      |

`dateKey` uses the `YYYY-MM-DD` format (`getDayKey` in `utils.js`) so the keys are lexicographically sortable.

## Implementation Plan

### Step 1: Add snapshot helpers in utils.js

- `getDayKey(date)` returns `YYYY-MM-DD`
- `normalizeRankHistory(saved, fallbackDate)` migrates legacy flat snapshots
- `appendDailySnapshot(rankHistory, dateKey, ranks, maxAgeDays, now)` records today's ranks (without overwriting an existing snapshot for the same day) then prunes old snapshots
- `pruneRankHistory(rankHistory, maxAgeDays, now)` removes snapshots older than the cutoff
- `getRankEvolution(rankHistory, coinId)` computes oldest minus newest retained rank

### Step 2: Save daily snapshot in loadData()

- Build `todayRanks` from `withRank`
- Call `appendDailySnapshot(rankHistory, today, todayRanks, RANK_HISTORY_MAX_AGE_DAYS)` and store the result
- Persist both keys to localStorage

### Step 3: Compute evolution in CryptoCard

- Receive `rankHistory` from App → CryptoGrid → CryptoCard
- Call `getRankEvolution(rankHistory, coin.id)` and render the badge
- `delta > 0` = improved, `delta < 0` = dropped, `delta === 0` = stable

### Step 4: Update tests

- Unit tests for `getDayKey`, `normalizeRankHistory`, `pruneRankHistory`, `getRankEvolution`
- App test for the first daily snapshot, same-day preservation, month retention and new-day append
- CryptoCard test for evolution badge rendering with dated snapshots
