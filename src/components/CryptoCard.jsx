import { useState, useEffect, useCallback, useRef } from 'react';
import { formatPrice } from '../core/utils.js';
import { fetchCryptoChart } from '../core/api.js';
import PriceChart from './PriceChart.jsx';

const chartCache = new Map();
const debounceTimers = new Map();

export default function CryptoCard({ coin }) {
  const [showChart, setShowChart] = useState(false);
  const [chartData, setChartData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const debounceRef = useRef(null);

  const change = coin.price_change_percentage_24h ?? 0;
  const isPositive = change >= 0;
  const changeClass = isPositive ? 'positive' : 'negative';
  const changeSign = isPositive ? '+' : '';

  const loadChart = useCallback(async () => {
    if (chartCache.has(coin.id)) {
      setChartData(chartCache.get(coin.id));
      return;
    }

    setIsLoading(true);
    try {
      const data = await fetchCryptoChart(coin.id);
      chartCache.set(coin.id, data.prices);
      setChartData(data.prices);
    } catch (err) {
      console.error('Failed to load chart:', err);
    } finally {
      setIsLoading(false);
    }
  }, [coin.id]);

  const handleMouseEnter = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    
    debounceRef.current = setTimeout(() => {
      setShowChart(true);
      loadChart();
    }, 300);
  }, [loadChart]);

  const handleMouseLeave = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setShowChart(false);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
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
          {isLoading ? (
            <div className="chart-loading">Chargement...</div>
          ) : chartData ? (
            <PriceChart prices={chartData} isPositive={isPositive} />
          ) : (
            <div className="chart-loading">Erreur</div>
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
