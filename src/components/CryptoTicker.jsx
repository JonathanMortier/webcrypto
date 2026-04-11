import { useEffect } from 'react';

const preloadedImages = new Set();

export default function CryptoTicker({ cryptos }) {
  useEffect(() => {
    cryptos.forEach(coin => {
      if (!preloadedImages.has(coin.id)) {
        const img = new Image();
        img.src = coin.image;
        preloadedImages.add(coin.id);
      }
    });
  }, [cryptos]);

  return (
    <div className="ticker-wrapper">
      <div className="ticker">
        {cryptos.map((coin, index) => (
          <div key={`${coin.id}-${index}`} className="ticker-item">
            <span className="rank">{index + 1}.</span>
            <img src={coin.image} alt={coin.name} />
            <span className="name">{coin.symbol.toUpperCase()}</span>
            <span className="gain positive">
              +{(coin.price_change_percentage_24h ?? 0).toFixed(2)}%
            </span>
          </div>
        ))}
        {cryptos.map((coin, index) => (
          <div key={`${coin.id}-dup-${index}`} className="ticker-item">
            <span className="rank">{index + 1}.</span>
            <img src={coin.image} alt={coin.name} />
            <span className="name">{coin.symbol.toUpperCase()}</span>
            <span className="gain positive">
              +{(coin.price_change_percentage_24h ?? 0).toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
