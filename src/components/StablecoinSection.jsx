import CryptoCard from './CryptoCard.jsx';
import { MIN_STABLECOIN_MARKET_CAP } from '../core/constants.js';

export default function StablecoinSection({
  stablecoins = [],
  show = false,
  onToggle,
  favorites = [],
  onToggleFavorite,
}) {
  const visibleStablecoins = stablecoins.filter((coin) => (coin.market_cap || 0) > MIN_STABLECOIN_MARKET_CAP);

  return (
    <div className="stablecoin-section">
      <button type="button" className="stablecoin-toggle" onClick={onToggle}>
        <span className={`stablecoin-caret ${show ? 'open' : ''}`}>▸</span>
        Stablecoins
        <span className="stablecoin-count">{visibleStablecoins.length}</span>
      </button>
      {show && (
        <div className="stablecoin-content">
          {visibleStablecoins.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">💵</div>
              <div>Aucun stablecoin disponible.</div>
            </div>
          ) : (
            <div className="crypto-grid">
              {visibleStablecoins.map((coin) => (
                <CryptoCard
                  key={coin.id}
                  coin={coin}
                  isFavorite={favorites.includes(coin.id)}
                  onToggleFavorite={onToggleFavorite}
                  hideRank
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
