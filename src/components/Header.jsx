import { formatTime } from '../core/utils.js';

export default function Header({ onRefresh, lastUpdate, isLoading, countdown, theme, onThemeToggle }) {
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
      <button 
        className="theme-toggle-btn" 
        onClick={onThemeToggle}
        title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
      >
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>
      {lastUpdate && (
        <p className="last-update">
          Dernière mise à jour: {formatTime(lastUpdate)} • Prochaine actualisation dans {countdown}s
        </p>
      )}
    </header>
  );
}
