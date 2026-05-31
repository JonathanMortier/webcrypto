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
