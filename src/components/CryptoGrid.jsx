import CryptoCard from './CryptoCard.jsx';

export default function CryptoGrid({ cryptos }) {
  return (
    <div className="crypto-grid">
      {cryptos.map(coin => (
        <CryptoCard key={coin.id} coin={coin} />
      ))}
    </div>
  );
}
