import { formatTime } from '../core/utils.js';

export default function Header({ onRefresh, lastUpdate, isLoading }) {
  return (
    <header className="header">
      <h1>CryptoWatch</h1>
      <p className="subtitle">Suivez les cours des principales cryptomonnaies en temps réel</p>
      <button 
        className="refresh-btn" 
        onClick={onRefresh}
        disabled={isLoading}
      >
        Actualiser
      </button>
      {lastUpdate && (
        <p className="last-update">Dernière mise à jour: {formatTime(lastUpdate)}</p>
      )}
    </header>
  );
}
