import { useMemo } from 'react';
import CryptoCard from './CryptoCard.jsx';

export default function CryptoGrid({ cryptos, sortField, sortDir, favorites = [], showFavoritesOnly = false, onToggleFavorite, hideRank }) {
  const filteredCryptos = useMemo(() => {
    if (showFavoritesOnly) {
      return cryptos.filter(c => favorites.includes(c.id));
    }
    return cryptos;
  }, [cryptos, showFavoritesOnly, favorites]);

  const sortedCryptos = useMemo(() => {
    return [...filteredCryptos].sort((a, b) => {
      let aVal, bVal;
      if (sortField === 'market_cap') {
        aVal = a.market_cap || 0;
        bVal = b.market_cap || 0;
      } else if (sortField === 'volume') {
        aVal = a.total_volume || 0;
        bVal = b.total_volume || 0;
      } else if (sortField === 'change') {
        aVal = a.price_change_percentage_24h || 0;
        bVal = b.price_change_percentage_24h || 0;
      }
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }, [filteredCryptos, sortField, sortDir]);

  if (sortedCryptos.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🔍</div>
        <div>Aucune crypto trouvée.</div>
      </div>
    );
  }

  return (
    <div className="crypto-grid">
      {sortedCryptos.map(coin => (
        <CryptoCard 
          key={coin.id} 
          coin={coin} 
          isFavorite={favorites.includes(coin.id)}
          onToggleFavorite={onToggleFavorite}
          hideRank={hideRank}
        />
      ))}
    </div>
  );
}
