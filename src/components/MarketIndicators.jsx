import { formatLargeNumber } from '../core/utils.js';
import WeatherWidget from './WeatherWidget.jsx';

export default function MarketIndicators({ marketStats, fearGreed, onSort, sortField, sortDir }) {
  if (!marketStats) return null;

  const { totalMarketCap, totalVolume, btcDominance, ethDominance, marketCapChange, altcoinSeason } = marketStats;

  const getAltcoinSeasonStatus = (value) => {
    if (value >= 75) return { text: 'Altcoin Season', color: 'var(--positive)' };
    if (value >= 50) return { text: 'Neutral', color: 'var(--text-secondary)' };
    return { text: 'Bitcoin Season', color: 'var(--gold)' };
  };
  const altcoinStatus = getAltcoinSeasonStatus(altcoinSeason);

  const fearGreedValue = fearGreed?.value || 50;
  const getFearGreedClass = (value) => {
    if (value <= 25) return { text: 'Extreme Fear', color: '#ff4444' };
    if (value <= 45) return { text: 'Fear', color: '#ff9933' };
    if (value <= 55) return { text: 'Neutral', color: '#ffcc00' };
    if (value <= 75) return { text: 'Greed', color: '#99cc33' };
    return { text: 'Extreme Greed', color: '#00ff88' };
  };
  const fearGreedStatus = getFearGreedClass(fearGreedValue);

  const getSortIndicator = (field) => {
    if (sortField !== field) return '';
    return sortDir === 'asc' ? ' ↑' : ' ↓';
  };

  return (
    <div className="market-indicators">
      <div className="indicator clickable" onClick={() => onSort?.('market_cap')}>
        <span className="indicator-label">Market Cap{getSortIndicator('market_cap')}</span>
        <span className="indicator-value">${formatLargeNumber(totalMarketCap)}</span>
      </div>

      <div className="indicator clickable" onClick={() => onSort?.('volume')}>
        <span className="indicator-label">Volume 24h{getSortIndicator('volume')}</span>
        <span className="indicator-value">${formatLargeNumber(totalVolume)}</span>
      </div>

      <div className="indicator clickable" onClick={() => onSort?.('change')}>
        <span className="indicator-label">Change 24h{getSortIndicator('change')}</span>
        <span className={`indicator-value ${parseFloat(marketCapChange) >= 0 ? 'positive' : 'negative'}`}>
          {parseFloat(marketCapChange) >= 0 ? '+' : ''}{marketCapChange}%
        </span>
      </div>

      <div className="indicator">
        <span className="indicator-label">BTC Dom.</span>
        <span className="indicator-value">{btcDominance}%</span>
      </div>

      <div className="indicator">
        <span className="indicator-label">ETH Dom.</span>
        <span className="indicator-value">{ethDominance}%</span>
      </div>

      <div className="indicator indicator-fear-greed">
        <span className="indicator-label">Fear & Greed</span>
        <span className="indicator-value" style={{ color: fearGreedStatus.color }}>
          {fearGreedValue}/100
        </span>
      </div>

      <div className="indicator">
        <span className="indicator-label">Alt. Season</span>
        <span className="indicator-value" style={{ color: altcoinStatus.color }}>
          {altcoinSeason}/100
        </span>
      </div>

      <WeatherWidget />
    </div>
  );
}
