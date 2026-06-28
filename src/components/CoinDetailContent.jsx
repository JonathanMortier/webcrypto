import { useState, lazy, Suspense } from 'react';
import { formatPrice, formatLargeNumber, getChangeClass, getChangeSign } from '../core/utils.js';
import { getImageUrl } from '../core/imageCache.js';

const PriceChart = lazy(() => import('./PriceChart.jsx'));

export default function CoinDetailContent({ coin, timeframe, setTimeframe, chartData, chartLoading }) {
  const [descExpanded, setDescExpanded] = useState(false);

  const md = coin.market_data || {};
  const change24h = md.price_change_percentage_24h ?? 0;
  const isPositive = change24h >= 0;
  const imageUrl = getImageUrl(coin.id, coin.image?.small || coin.image?.large);

  const athDate = md.ath_date?.usd
    ? new Date(md.ath_date.usd).toLocaleDateString('fr-FR')
    : 'N/A';
  const atlDate = md.atl_date?.usd
    ? new Date(md.atl_date.usd).toLocaleDateString('fr-FR')
    : 'N/A';

  const description = coin.description?.en || '';
  const descTruncated = description.length > 300;
  const descText = descExpanded || !descTruncated ? description : description.slice(0, 300) + '...';

  const categories = coin.categories || [];
  const links = coin.links || {};
  const homepage = links.homepage?.find(h => h) || '';
  const explorers = (links.blockchain_site || []).filter(Boolean);
  const sentimentUp = coin.sentiment_votes_up_percentage ?? null;
  const sentimentDown = coin.sentiment_votes_down_percentage ?? null;

  const change7d = md.price_change_percentage_7d;
  const change30d = md.price_change_percentage_30d;
  const change1y = md.price_change_percentage_1y;

  const getTimeframeLabel = (tf) => {
    const labels = { '1h': '1h', '24h': '24h', '7d': '7j', '30d': '30j', '1y': '1an' };
    return labels[tf] || tf;
  };

  const priceChangeBadges = [
    { label: '7j', value: change7d },
    { label: '30j', value: change30d },
    { label: '1an', value: change1y },
  ];

  return (
    <div>
      <div className="coin-detail-hero">
        <img src={imageUrl} alt={coin.name} className="coin-detail-icon" />
        <div className="coin-detail-hero-info">
          <div className="coin-detail-title-row">
            <h1>{coin.name}</h1>
            <span className="coin-detail-symbol">{coin.symbol?.toUpperCase()}</span>
            {coin.market_cap_rank && (
              <span className="coin-detail-rank">#{coin.market_cap_rank}</span>
            )}
          </div>
          {categories.length > 0 && (
            <div className="coin-detail-categories">
              {categories.slice(0, 4).map((cat) => (
                <span key={cat} className="coin-detail-cat-tag">{cat}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="coin-detail-price-card">
        <div className="coin-detail-price-main">
          <span className="coin-detail-price">${formatPrice(md.current_price?.usd || 0)}</span>
          <span className={`coin-detail-badge ${getChangeClass(change24h)}`}>
            {getChangeSign(change24h)}{change24h.toFixed(2)}%
          </span>
        </div>
        {change7d !== null && change7d !== undefined && (
          <div className="coin-detail-price-changes">
            {priceChangeBadges.map(({ label, value }) => {
              if (value === null || value === undefined) return null;
              return (
                <span key={label} className={`coin-detail-change-sm ${getChangeClass(value)}`}>
                  {getChangeSign(value)}{value.toFixed(2)}% ({label})
                </span>
              );
            })}
          </div>
        )}
      </div>

      {description && (
        <div className="coin-detail-section">
          <h2 className="coin-detail-section-title">À propos</h2>
          <p className="coin-detail-desc" dangerouslySetInnerHTML={{ __html: descText }} />
          {descTruncated && (
            <button className="coin-detail-desc-toggle" onClick={() => setDescExpanded(!descExpanded)}>
              {descExpanded ? 'Réduire' : 'Lire la suite'}
            </button>
          )}
        </div>
      )}

      <div className="coin-detail-section">
        <h2 className="coin-detail-section-title">Graphique de prix</h2>
        <div className="coin-detail-chart">
          <div className="coin-detail-chart-header">
            <div className="coin-detail-timeframes">
              {['1h', '24h', '7d', '30d', '1y'].map((tf) => (
                <button
                  key={tf}
                  type="button"
                  className={`timeframe-btn ${timeframe === tf ? 'active' : ''}`}
                  onClick={() => setTimeframe(tf)}
                >
                  {getTimeframeLabel(tf)}
                </button>
              ))}
            </div>
          </div>
          <div className="coin-detail-chart-body">
            {chartLoading ? (
              <div className="chart-loading">Chargement...</div>
            ) : chartData.length > 0 ? (
              <Suspense fallback={<div className="chart-loading">Chargement...</div>}>
                <PriceChart prices={chartData} isPositive={isPositive} timeframe={timeframe} />
              </Suspense>
            ) : (
              <div className="chart-loading">Graphique indisponible</div>
            )}
          </div>
        </div>
      </div>

      <div className="coin-detail-section">
        <h2 className="coin-detail-section-title">Statistiques marché</h2>
        <div className="coin-detail-stats">
          <div className="coin-detail-stat">
            <span className="coin-detail-stat-label">Capitalisation</span>
            <span className="coin-detail-stat-value">${formatLargeNumber(md.market_cap?.usd || 0)}</span>
            {md.market_cap_change_percentage_24h !== null && md.market_cap_change_percentage_24h !== undefined && (
              <span className={`coin-detail-stat-sub ${getChangeClass(md.market_cap_change_percentage_24h)}`}>
                {getChangeSign(md.market_cap_change_percentage_24h)}{md.market_cap_change_percentage_24h.toFixed(2)}% (24h)
              </span>
            )}
          </div>
          <div className="coin-detail-stat">
            <span className="coin-detail-stat-label">Volume 24h</span>
            <span className="coin-detail-stat-value">${formatLargeNumber(md.total_volume?.usd || 0)}</span>
            {md.total_volume?.usd && md.market_cap?.usd && (
              <span className="coin-detail-stat-sub">
                Vol./Cap. {(md.total_volume.usd / md.market_cap.usd * 100).toFixed(1)}%
              </span>
            )}
          </div>
          <div className="coin-detail-stat">
            <span className="coin-detail-stat-label">Fully Diluted Valuation</span>
            <span className="coin-detail-stat-value">
              {md.fully_diluted_valuation?.usd
                ? `$${formatLargeNumber(md.fully_diluted_valuation.usd)}`
                : 'N/A'}
            </span>
          </div>
          <div className="coin-detail-stat">
            <span className="coin-detail-stat-label">Offre en circulation</span>
            <span className="coin-detail-stat-value">{formatLargeNumber(md.circulating_supply || 0)}</span>
          </div>
          <div className="coin-detail-stat">
            <span className="coin-detail-stat-label">Offre totale</span>
            <span className="coin-detail-stat-value">
              {md.total_supply ? formatLargeNumber(md.total_supply) : '∞'}
            </span>
          </div>
          <div className="coin-detail-stat">
            <span className="coin-detail-stat-label">Offre maximale</span>
            <span className="coin-detail-stat-value">
              {md.max_supply ? formatLargeNumber(md.max_supply) : '∞'}
            </span>
          </div>
          <div className="coin-detail-stat">
            <span className="coin-detail-stat-label">All-Time-High</span>
            <span className="coin-detail-stat-value">${formatPrice(md.ath?.usd || 0)}</span>
            <span className="coin-detail-stat-sub">{athDate}</span>
          </div>
          <div className="coin-detail-stat">
            <span className="coin-detail-stat-label">All-Time-Low</span>
            <span className="coin-detail-stat-value">${formatPrice(md.atl?.usd || 0)}</span>
            <span className="coin-detail-stat-sub">{atlDate}</span>
          </div>
          <div className="coin-detail-stat">
            <span className="coin-detail-stat-label">Plus haut 24h</span>
            <span className="coin-detail-stat-value">${formatPrice(md.high_24h?.usd || 0)}</span>
          </div>
          <div className="coin-detail-stat">
            <span className="coin-detail-stat-label">Plus bas 24h</span>
            <span className="coin-detail-stat-value">${formatPrice(md.low_24h?.usd || 0)}</span>
          </div>
        </div>
      </div>

      {(sentimentUp !== null || sentimentDown !== null) && (
        <div className="coin-detail-section">
          <h2 className="coin-detail-section-title">Sentiment communauté</h2>
          <div className="coin-detail-sentiment">
            <div className="coin-detail-sentiment-bar">
              <div
                className="coin-detail-sentiment-up"
                style={{ width: `${sentimentUp}%` }}
              >
                {sentimentUp > 15 && <span>{sentimentUp.toFixed(0)}%</span>}
              </div>
              <div
                className="coin-detail-sentiment-down"
                style={{ width: `${sentimentDown}%` }}
              >
                {sentimentDown > 15 && <span>{sentimentDown.toFixed(0)}%</span>}
              </div>
            </div>
            <div className="coin-detail-sentiment-labels">
              <span className="positive">👍 {sentimentUp.toFixed(0)}%</span>
              <span className="negative">👎 {sentimentDown.toFixed(0)}%</span>
            </div>
          </div>
        </div>
      )}

      {coin.genesis_date && (
        <div className="coin-detail-section">
          <h2 className="coin-detail-section-title">Informations</h2>
          <div className="coin-detail-info-grid">
            <div className="coin-detail-info-item">
              <span className="coin-detail-info-label">Date de création</span>
              <span className="coin-detail-info-value">
                {new Date(coin.genesis_date).toLocaleDateString('fr-FR', {
                  year: 'numeric', month: 'long', day: 'numeric'
                })}
              </span>
            </div>
          </div>
        </div>
      )}

      {(homepage || explorers.length > 0 || links.subreddit_url || links.twitter_screen_name || links.telegram_channel_identifier) && (
        <div className="coin-detail-section">
          <h2 className="coin-detail-section-title">Liens</h2>
          <div className="coin-detail-links">
            {homepage && (
              <a href={homepage} target="_blank" rel="noopener noreferrer" className="coin-detail-link-btn" title="Site web">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
                Site web
              </a>
            )}
            {explorers.slice(0, 3).map((url, i) => {
              const label = url.includes('etherscan') ? 'Etherscan'
                : url.includes('solscan') ? 'Solscan'
                : url.includes('bscscan') ? 'BscScan'
                : url.includes('explorer') ? 'Explorateur'
                : `Explorateur ${i + 1}`;
              return (
                <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="coin-detail-link-btn" title={label}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <line x1="3" y1="9" x2="21" y2="9" />
                    <line x1="9" y1="21" x2="9" y2="9" />
                  </svg>
                  {label}
                </a>
              );
            })}
            {links.twitter_screen_name && (
              <a href={`https://x.com/${links.twitter_screen_name}`} target="_blank" rel="noopener noreferrer" className="coin-detail-link-btn" title="X (Twitter)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                X (Twitter)
              </a>
            )}
            {links.subreddit_url && (
              <a href={links.subreddit_url} target="_blank" rel="noopener noreferrer" className="coin-detail-link-btn" title="Reddit">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                  <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.88 7.88a1.82 1.82 0 0 1 1.82 1.82 1.8 1.8 0 0 1-.74 1.45 5.34 5.34 0 0 1 .1.99c0 3.48-3.64 6.3-8.12 6.3-4.48 0-8.12-2.82-8.12-6.3 0-.33.04-.66.1-.99a1.8 1.8 0 0 1-.74-1.45 1.82 1.82 0 0 1 3.43-.81 7.93 7.93 0 0 1 4.25-1.28l.78-3.88a.33.33 0 0 1 .39-.27l2.6.52a1.31 1.31 0 0 1 1.25-.95 1.32 1.32 0 0 1 1.32 1.32 1.3 1.3 0 0 1-1.3 1.3c-.55 0-1-.35-1.2-.83l-2.32-.46-.7 3.48a7.93 7.93 0 0 1 4.1 1.26 1.82 1.82 0 0 1 1.6-.9z" />
                </svg>
                Reddit
              </a>
            )}
            {links.telegram_channel_identifier && (
              <a href={`https://t.me/${links.telegram_channel_identifier}`} target="_blank" rel="noopener noreferrer" className="coin-detail-link-btn" title="Telegram">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                </svg>
                Telegram
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
