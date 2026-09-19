import { describe, it, expect } from 'vitest';
import {
  formatPrice,
  formatLargeNumber,
  getChangeClass,
  getChangeSign,
  formatTime,
  getDayKey,
  normalizeRankHistory,
  appendDailySnapshot,
  pruneRankHistory,
  getRankEvolution,
} from '../core/utils.js';

describe('formatPrice', () => {
  it('should format price >= 1 with 2 decimal places', () => {
    expect(formatPrice(1)).toBe('1.00');
    expect(formatPrice(1234.56)).toBe('1,234.56');
    expect(formatPrice(50000)).toBe('50,000.00');
  });

  it('should format price < 1 with 4-6 decimal places', () => {
    expect(formatPrice(0.5)).toBe('0.5000');
    expect(formatPrice(0.123456)).toBe('0.123456');
    expect(formatPrice(0.0000123)).toBe('0.000012');
  });
});

describe('formatLargeNumber', () => {
  it('should format trillions', () => {
    expect(formatLargeNumber(1e12)).toBe('1.00T');
    expect(formatLargeNumber(1.5e12)).toBe('1.50T');
  });

  it('should format billions', () => {
    expect(formatLargeNumber(1e9)).toBe('1.00B');
    expect(formatLargeNumber(2.5e9)).toBe('2.50B');
  });

  it('should format millions', () => {
    expect(formatLargeNumber(1e6)).toBe('1.00M');
    expect(formatLargeNumber(5.75e6)).toBe('5.75M');
  });

  it('should format smaller numbers with locale', () => {
    expect(formatLargeNumber(500000)).toBe('500,000');
  });
});

describe('getChangeClass', () => {
  it('should return positive for change >= 0', () => {
    expect(getChangeClass(0)).toBe('positive');
    expect(getChangeClass(5)).toBe('positive');
  });

  it('should return negative for change < 0', () => {
    expect(getChangeClass(-1)).toBe('negative');
    expect(getChangeClass(-10.5)).toBe('negative');
  });
});

describe('getChangeSign', () => {
  it('should return + for positive change', () => {
    expect(getChangeSign(0)).toBe('+');
    expect(getChangeSign(1)).toBe('+');
  });
});

describe('formatTime', () => {
  it('should format time in French locale', () => {
    const date = new Date('2024-01-01T12:00:00');
    const formatted = formatTime(date);
    expect(formatted).toContain('12:00:00');
  });

  it('should default to current time', () => {
    const result = formatTime();
    expect(result).toBeDefined();
  });
});

describe('getDayKey', () => {
  it('should format a date as YYYY-MM-DD', () => {
    expect(getDayKey(new Date('2026-09-12T10:30:00'))).toBe('2026-09-12');
  });

  it('should default to current date', () => {
    const result = getDayKey();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('normalizeRankHistory', () => {
  it('should wrap legacy flat format into a dated snapshot', () => {
    const result = normalizeRankHistory({ bitcoin: 1, ethereum: 2 }, '');
    const keys = Object.keys(result);
    expect(keys).toHaveLength(1);
    expect(result[keys[0]]).toEqual({ bitcoin: 1, ethereum: 2 });
  });

  it('should use provided fallback date for legacy snapshot', () => {
    const result = normalizeRankHistory({ bitcoin: 3 }, '2026-09-10');
    expect(result).toEqual({ '2026-09-10': { bitcoin: 3 } });
  });

  it('should convert legacy toDateString to YYYY-MM-DD key', () => {
    const result = normalizeRankHistory({ bitcoin: 3 }, 'Sat Sep 12 2026');
    expect(result).toEqual({ '2026-09-12': { bitcoin: 3 } });
  });

  it('should return dateless format unchanged', () => {
    const dated = { '2026-09-12': { bitcoin: 1 } };
    expect(normalizeRankHistory(dated)).toEqual(dated);
  });

  it('should return empty object for invalid input', () => {
    expect(normalizeRankHistory(null)).toEqual({});
    expect(normalizeRankHistory(undefined)).toEqual({});
    expect(normalizeRankHistory([])).toEqual({});
    expect(normalizeRankHistory('not-an-object')).toEqual({});
  });
});

describe('pruneRankHistory', () => {
  const refDate = new Date('2026-09-12T10:00:00');

  it('should keep snapshots within max age', () => {
    const history = {
      '2026-08-12': { bitcoin: 1 },
      '2026-09-12': { bitcoin: 1 },
    };
    const result = pruneRankHistory(history, 30, refDate);
    expect(result).toEqual({ '2026-09-12': { bitcoin: 1 } });
  });

  it('should drop snapshots older than max age', () => {
    const history = {
      '2026-08-11': { ethereum: 2 },
      '2026-09-12': { bitcoin: 1 },
    };
    const result = pruneRankHistory(history, 30, refDate);
    expect(result['2026-08-11']).toBeUndefined();
    expect(result['2026-09-12']).toBeDefined();
  });

  it('should keep snapshot exactly at cutoff', () => {
    const history = { '2026-08-13': { bitcoin: 1 }, '2026-08-12': { bitcoin: 2 } };
    const result = pruneRankHistory(history, 30, refDate);
    expect(result['2026-08-13']).toBeDefined();
    expect(result['2026-08-12']).toBeUndefined();
  });

  it('should keep all snapshots when within range', () => {
    const history = { '2026-08-13': { bitcoin: 1 }, '2026-09-12': { bitcoin: 1 } };
    const result = pruneRankHistory(history, 60, refDate);
    expect(Object.keys(result)).toHaveLength(2);
  });
});

describe('getRankEvolution', () => {
  it('should return null when no history exists', () => {
    expect(getRankEvolution({}, 'bitcoin')).toBeNull();
  });

  it('should return null when coin is not in any snapshot', () => {
    const history = { '2026-09-12': { ethereum: 2 } };
    expect(getRankEvolution(history, 'bitcoin')).toBeNull();
  });

  it('should return null when only one snapshot exists', () => {
    const history = { '2026-09-12': { bitcoin: 1 } };
    expect(getRankEvolution(history, 'bitcoin')).toBeNull();
  });

  it('should compute positive evolution when rank improved', () => {
    const history = {
      '2026-08-13': { bitcoin: 10 },
      '2026-09-12': { bitcoin: 3 },
    };
    expect(getRankEvolution(history, 'bitcoin')).toBe(7);
  });

  it('should compute negative evolution when rank dropped', () => {
    const history = {
      '2026-08-13': { bitcoin: 4 },
      '2026-09-12': { bitcoin: 8 },
    };
    expect(getRankEvolution(history, 'bitcoin')).toBe(-4);
  });

  it('should return 0 when rank unchanged', () => {
    const history = {
      '2026-08-13': { bitcoin: 5 },
      '2026-09-12': { bitcoin: 5 },
    };
    expect(getRankEvolution(history, 'bitcoin')).toBe(0);
  });

  it('should use oldest and newest snapshots regardless of order', () => {
    const history = {
      '2026-09-12': { bitcoin: 8 },
      '2026-08-13': { bitcoin: 3 },
    };
    expect(getRankEvolution(history, 'bitcoin')).toBe(-5);
  });
});

describe('appendDailySnapshot', () => {
  const refDate = new Date('2026-09-12T10:00:00');

  it('should add a new daily snapshot when the day is absent', () => {
    const result = appendDailySnapshot({}, '2026-09-12', { bitcoin: 1 }, 30, refDate);
    expect(result).toEqual({ '2026-09-12': { bitcoin: 1 } });
  });

  it('should preserve the first snapshot of the day when appending again', () => {
    const history = { '2026-09-12': { bitcoin: 5 } };
    const result = appendDailySnapshot(history, '2026-09-12', { bitcoin: 8 }, 30, refDate);
    expect(result).toEqual({ '2026-09-12': { bitcoin: 5 } });
  });

  it('should prune old snapshots after appending', () => {
    const history = { '2026-08-11': { bitcoin: 9 }, '2026-09-11': { bitcoin: 3 } };
    const result = appendDailySnapshot(history, '2026-09-12', { bitcoin: 2 }, 30, refDate);
    expect(result['2026-08-11']).toBeUndefined();
    expect(result['2026-09-11']).toBeDefined();
    expect(result['2026-09-12']).toBeDefined();
  });
});

describe('Rank snapshot - 60 days of daily connections', () => {
  const dayMs = 24 * 60 * 60 * 1000;
  const start = new Date('2026-01-01T12:00:00');
  const maxAge = 30;
  const coinIds = ['bitcoin', 'ethereum', 'solana', 'tether'];

  it('should accumulate one snapshot per day over a full month', () => {
    let history = {};

    for (let day = 0; day < 30; day++) {
      const now = new Date(start.getTime() + day * dayMs);
      const dateKey = getDayKey(now);
      const ranks = {};
      coinIds.forEach((id, i) => {
        ranks[id] = i + 1;
      });
      history = appendDailySnapshot(history, dateKey, ranks, maxAge, now);
    }

    expect(Object.keys(history)).toHaveLength(30);
    expect(getDayKey(start)).toBeDefined();
    expect(getDayKey(new Date(start.getTime() + 29 * dayMs))).toBeDefined();
  });

  it('should keep a rolling window after 60 days of connections', () => {
    let history = {};

    for (let day = 0; day < 60; day++) {
      const now = new Date(start.getTime() + day * dayMs);
      const dateKey = getDayKey(now);
      const ranks = {};
      coinIds.forEach((id, i) => {
        ranks[id] = i + 1;
      });
      history = appendDailySnapshot(history, dateKey, ranks, maxAge, now);
    }

    const keys = Object.keys(history).sort();
    expect(keys).toHaveLength(maxAge + 1);
    expect(keys[0]).toBe(getDayKey(new Date(start.getTime() + 29 * dayMs)));
    expect(keys[keys.length - 1]).toBe(getDayKey(new Date(start.getTime() + 59 * dayMs)));
    expect(keys[1]).toBe(getDayKey(new Date(start.getTime() + 30 * dayMs)));
  });

  it('should keep snapshots when the app stays open across midnight', () => {
    let history = {};
    for (let day = 0; day < 31; day++) {
      const now = new Date(start.getTime() + day * dayMs);
      history = appendDailySnapshot(history, getDayKey(now), { bitcoin: day + 1 }, maxAge, now);
      history = appendDailySnapshot(history, getDayKey(now), { bitcoin: 999 }, maxAge, now);
    }
    expect(Object.keys(history).sort()).toHaveLength(31);
    expect(history[getDayKey(new Date(start.getTime()))].bitcoin).toBe(1);
    expect(history[getDayKey(new Date(start.getTime() + 30 * dayMs))].bitcoin).toBe(31);
  });
});
