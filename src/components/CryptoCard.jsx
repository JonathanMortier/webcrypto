import { useState, useCallback, useRef, useEffect, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { formatPrice } from '../core/utils.js';
import { getImageUrl } from '../core/imageCache.js';
import { fetchCoinHistory } from '../core/api.js';

const PriceChart = lazy(() => import('./PriceChart.jsx'));

export default function CryptoCard({ coin, isFavorite, onToggleFavorite, hideRank, rankHistory = {} }) {
  const [showChart, setShowChart] = useState(false);
  const [timeframe, setTimeframe] = useState('7d');
  const [chartData, setChartData] = useState([]);
  const [chartLoading, setChartLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const debounceRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 580);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleChart = useCallback(() => {
    setShowChart((prev) => !prev);
  }, []);

  const change = coin.price_change_percentage_24h ?? 0;
  const isPositive = change >= 0;
  const changeClass = isPositive ? 'positive' : 'negative';
  const changeSign = isPositive ? '+' : '';

  const ath = coin.ath || 0;

  const sparklineData = coin.sparkline_in_7d?.price || [];
  const imageUrl = getImageUrl(coin.id, coin.image);

  const previousRank = rankHistory[coin.id];
  const validPreviousRank = typeof previousRank === 'number' && Number.isFinite(previousRank) && previousRank > 0;
  const rankEvolution = validPreviousRank && coin.display_rank != null ? previousRank - coin.display_rank : null;

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

  useEffect(() => {
    if (!showChart || !coin.id) return;
    const loadChartData = async () => {
      setChartLoading(true);
      try {
        const daysMap = { '1h': 1, '24h': 1, '7d': 7, '30d': 30, '1y': 365 };
        const days = daysMap[timeframe] || 7;
        const data = await fetchCoinHistory(coin.id, days);
        if (data.prices) {
          setChartData(data.prices);
        }
      } catch (err) {
        console.error('Failed to load chart:', err);
      } finally {
        setChartLoading(false);
      }
    };
    loadChartData();
  }, [showChart, timeframe, coin.id]);

  const handleTimeframeChange = (tf) => {
    setTimeframe(tf);
  };

  const getTimeframeLabel = (tf) => {
    const labels = { '1h': '1h', '24h': '24h', '7d': '7j', '30d': '30j', '1y': '1an' };
    return labels[tf] || tf;
  };

  return (
    <div
      className={`crypto-card ${isMobile ? 'mobile' : ''}`}
      onMouseEnter={!isMobile ? handleMouseEnter : undefined}
      onMouseLeave={!isMobile ? handleMouseLeave : undefined}
    >
      <div className="crypto-actions">
        <button
          className={`favorite-btn ${isFavorite ? 'active' : ''}`}
          onClick={() => onToggleFavorite?.(coin.id)}
          title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill={isFavorite ? '#ffd700' : 'none'}
            stroke={isFavorite ? '#ffd700' : '#888'}
            strokeWidth="2"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </button>
        <a
          href={`https://www.coingecko.com/en/coins/${coin.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="coingecko-link"
          title="Voir sur CoinGecko"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </a>
      </div>

      <Link to={`/coin/${coin.id}`} className="crypto-card-link">
        {!hideRank && coin.display_rank && (
          <span className="crypto-rank">
            #{coin.display_rank}
            {rankEvolution !== null && rankEvolution !== 0 && (
              <span className={`rank-evolution ${rankEvolution > 0 ? 'rank-up' : 'rank-down'}`}>
                {rankEvolution > 0 ? '▲' : '▼'}
                {Math.abs(rankEvolution)}
              </span>
            )}
            {rankEvolution === 0 && <span className="rank-evolution rank-stable">—</span>}
          </span>
        )}
        <img
          src={imageUrl}
          alt={coin.name}
          className="crypto-icon"
          loading="lazy"
          onError={(e) => {
            if (e.target.src !== coin.image) e.target.src = coin.image;
          }}
        />
        <div className="crypto-info">
          <div className="crypto-name">{coin.name}</div>
          <div className="crypto-symbol">{coin.symbol}</div>
        </div>
        <div className="crypto-main-row">
          <span className="crypto-price">${formatPrice(coin.current_price)}</span>
          <span className={`crypto-change ${changeClass}`}>
            {changeSign}
            {change.toFixed(2)}%
          </span>
        </div>
        <div className="crypto-stats">
          <div className="stat">
            <div className="stat-label">MCap</div>
            <div className="stat-value">${formatLargeNumber(coin.market_cap)}</div>
          </div>
          <div className="stat">
            <div className="stat-label">Volume</div>
            <div className="stat-value">${formatLargeNumber(coin.total_volume)}</div>
          </div>
          <div className="stat">
            <div className="stat-label">ATH</div>
            <div className="stat-value">{ath > 0 ? `$${formatPrice(ath)}` : 'N/A'}</div>
          </div>
        </div>
      </Link>

      {isMobile && !showChart && (
        <button type="button" className="chart-toggle-btn" onClick={toggleChart}>
          Graphique
        </button>
      )}

      {showChart && (
        <div className="crypto-chart">
          <div className="chart-header">
            <span className="chart-title">Prix</span>
            <div className="chart-timeframes">
              {['1h', '24h', '7d', '30d', '1y'].map((tf) => (
                <button
                  key={tf}
                  type="button"
                  className={`timeframe-btn ${timeframe === tf ? 'active' : ''}`}
                  onClick={() => handleTimeframeChange(tf)}
                >
                  {getTimeframeLabel(tf)}
                </button>
              ))}
            </div>
          </div>
          <div className="chart-content">
            {chartLoading ? (
              <div className="chart-loading">Chargement...</div>
            ) : chartData.length > 0 ? (
              <Suspense fallback={<div className="chart-loading">Chargement...</div>}>
                <PriceChart prices={chartData} isPositive={isPositive} timeframe={timeframe} />
              </Suspense>
            ) : sparklineData.length > 0 ? (
              <Suspense fallback={<div className="chart-loading">Chargement...</div>}>
                <PriceChart prices={sparklineData} isPositive={isPositive} timeframe={timeframe} />
              </Suspense>
            ) : (
              <div className="chart-loading">Graphique indisponible</div>
            )}
          </div>
          {isMobile && (
            <button type="button" className="chart-toggle-btn" onClick={toggleChart}>
              Masquer
            </button>
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
