export function formatPrice(price) {
  if (price >= 1) {
    return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return price.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 6 });
}

export function formatLargeNumber(num) {
  if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  return num.toLocaleString('en-US');
}

export function getChangeClass(change) {
  return change >= 0 ? 'positive' : 'negative';
}

export function getChangeSign(change) {
  return change >= 0 ? '+' : '';
}

export function formatTime(date = new Date()) {
  return date.toLocaleTimeString('fr-FR');
}

export function getDayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Legacy format was { coinId: rank } (single snapshot). New format is
// { dateKey: { coinId: rank } } (one snapshot per day).
export function normalizeRankHistory(saved, fallbackDate = '') {
  if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return {};
  const entries = Object.entries(saved);
  if (entries.length === 0) return {};
  if (typeof entries[0][1] === 'number') {
    const dateKey = fallbackDate ? getDayKey(new Date(fallbackDate)) : getDayKey();
    return { [dateKey]: Object.fromEntries(entries) };
  }
  return saved;
}

export function pruneRankHistory(rankHistory = {}, maxAgeDays = 30, now = new Date()) {
  const cutoff = getDayKey(new Date(now.getTime() - maxAgeDays * 24 * 60 * 60 * 1000));
  const result = {};
  for (const [date, ranks] of Object.entries(rankHistory)) {
    if (date >= cutoff) result[date] = ranks;
  }
  return result;
}

// Records today's snapshot (kept untouched if already present) then prunes to maxAgeDays.
export function appendDailySnapshot(rankHistory = {}, dateKey, ranks, maxAgeDays = 30, now = new Date()) {
  const next = { ...rankHistory };
  if (!Object.prototype.hasOwnProperty.call(next, dateKey)) {
    next[dateKey] = ranks;
  }
  return pruneRankHistory(next, maxAgeDays, now);
}

export function getRankEvolution(rankHistory = {}, coinId) {
  const ranks = [];
  for (const [date, snap] of Object.entries(rankHistory)) {
    const rank = snap?.[coinId];
    if (typeof rank === 'number' && Number.isFinite(rank) && rank > 0) {
      ranks.push({ date, rank });
    }
  }
  if (ranks.length < 2) return null;
  ranks.sort((a, b) => a.date.localeCompare(b.date));
  return ranks[0].rank - ranks[ranks.length - 1].rank;
}
