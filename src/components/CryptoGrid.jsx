import { useMemo } from 'react';
import CryptoCard from './CryptoCard.jsx';

export default function CryptoGrid({ cryptos, sortField, sortDir }) {
  const sortedCryptos = useMemo(() => {
    return [...cryptos].sort((a, b) => {
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
  }, [cryptos, sortField, sortDir]);

  return (
    <div className="crypto-grid">
      {sortedCryptos.map(coin => (
        <CryptoCard key={coin.id} coin={coin} />
      ))}
    </div>
  );
}
