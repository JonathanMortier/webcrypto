import { useState, useCallback, useRef, useEffect } from 'react';
import { formatPrice } from '../core/utils.js';
import PriceChart from './PriceChart.jsx';

const preloadedImages = new Set();

export default function CryptoCard({ coin }) {
  const [showChart, setShowChart] = useState(false);
  
  const debounceRef = useRef(null);

  const change = coin.price_change_percentage_24h ?? 0;
  const isPositive = change >= 0;
  const changeClass = isPositive ? 'positive' : 'negative';
  const changeSign = isPositive ? '+' : '';

  const sparklineData = coin.sparkline_in_7d?.price || [];

  useEffect(() => {
    if (!preloadedImages.has(coin.id)) {
      const img = new Image();
      img.src = coin.image;
      preloadedImages.add(coin.id);
    }
  }, [coin.id, coin.image]);

  const handleMouseEnter = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    
    debounceRef.current = setTimeout(() => {
      setShowChart(true);
    }, 300);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setShowChart(false);
  }, []);

  return (
    <div 
      className="crypto-card"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
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

      {showChart && (
        <div className="chart-overlay">
          {sparklineData.length > 0 ? (
            <PriceChart prices={sparklineData} isPositive={isPositive} />
          ) : (
            <div className="chart-loading">Graphique indisponible</div>
          )}
        </div>
      )}
    </div>
  );
}

function formatLargeNumber(num) {
  if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  return num.toLocaleString();
}
