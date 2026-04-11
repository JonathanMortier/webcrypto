import { formatPrice } from '../core/utils.js';

export default function CryptoCard({ coin }) {
  const change = coin.price_change_percentage_24h ?? 0;
  const changeClass = change >= 0 ? 'positive' : 'negative';
  const changeSign = change >= 0 ? '+' : '';

  return (
    <div className="crypto-card">
      <div className="crypto-header">
        <img src={coin.image} alt={coin.name} className="crypto-icon" />
        <div>
          <div className="crypto-name">{coin.name}</div>
          <div className="crypto-symbol">{coin.symbol}</div>
        </div>
      </div>
      <div className="crypto-price">${formatPrice(coin.current_price)}</div>
      <span className={`crypto-change ${changeClass}`}>
        {changeSign}{change.toFixed(2)}% (24h)
      </span>
      <div className="crypto-stats">
        <div className="stat">
          <div className="stat-label">Market Cap</div>
          <div className="stat-value">${formatLargeNumber(coin.market_cap)}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Volume 24h</div>
          <div className="stat-value">${formatLargeNumber(coin.total_volume)}</div>
        </div>
      </div>
    </div>
  );
}

function formatLargeNumber(num) {
  if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  return num.toLocaleString();
}
