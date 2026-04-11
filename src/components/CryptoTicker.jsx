import { getImageUrl } from '../core/imageCache.js';

export default function CryptoTicker({ cryptos }) {
  return (
    <div className="ticker-wrapper">
      <div className="ticker">
        {cryptos.map((coin, index) => (
          <div key={`${coin.id}-${index}`} className="ticker-item">
            <span className="rank">{index + 1}.</span>
            <img src={getImageUrl(coin.id, coin.image)} alt={coin.name} />
            <span className="name">{coin.symbol.toUpperCase()}</span>
            <span className="gain positive">
              +{(coin.price_change_percentage_24h ?? 0).toFixed(2)}%
            </span>
          </div>
        ))}
        <div className="ticker-separator" aria-hidden="true">✦</div>
        {cryptos.map((coin, index) => (
          <div key={`${coin.id}-dup-${index}`} className="ticker-item">
            <span className="rank">{index + 1}.</span>
            <img src={getImageUrl(coin.id, coin.image)} alt={coin.name} />
            <span className="name">{coin.symbol.toUpperCase()}</span>
            <span className="gain positive">
              +{(coin.price_change_percentage_24h ?? 0).toFixed(2)}%
            </span>
          </div>
        ))}
        <div className="ticker-separator" aria-hidden="true">✦</div>
      </div>
    </div>
  );
}
