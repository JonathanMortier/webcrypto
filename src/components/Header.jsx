import { formatTime } from '../core/utils.js';

export default function Header({ onRefresh, lastUpdate, isLoading, countdown, theme, onThemeToggle, searchQuery, onSearchChange, favoritesCount, showFavoritesOnly, onToggleFavoritesFilter, notificationsEnabled, onToggleNotifications }) {
  return (
    <header className="header">
      <h1>CryptoWatch</h1>
      <p className="subtitle">Suivez les cours des principales cryptomonnaies en temps réel</p>
      <div className="header-controls">
        <input
          type="text"
          className="search-input"
          placeholder="Rechercher une crypto... (F)"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <button 
          className={`favorites-filter-btn ${showFavoritesOnly ? 'active' : ''}`}
          onClick={onToggleFavoritesFilter}
          title={showFavoritesOnly ? 'Voir toutes les cryptos' : 'Voir uniquement les favoris'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill={showFavoritesOnly ? '#ffd700' : 'none'} stroke={showFavoritesOnly ? '#ffd700' : 'currentColor'} strokeWidth="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          {favoritesCount > 0 && <span className="favorites-count">{favoritesCount}</span>}
        </button>
        <button 
          className={`notifications-btn ${notificationsEnabled ? 'active' : ''}`}
          onClick={onToggleNotifications}
          title={notificationsEnabled ? 'Désactiver les notifications' : 'Activer les notifications'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill={notificationsEnabled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </button>
        <button 
          className="refresh-btn" 
          onClick={onRefresh}
          disabled={isLoading}
        >
          Actualiser (R)
        </button>
        <button 
          className="theme-toggle-btn" 
          onClick={onThemeToggle}
          title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>
      {lastUpdate && (
        <p className="last-update">
          Dernière mise à jour: {formatTime(lastUpdate)} • Prochaine actualisation dans {countdown}s
        </p>
      )}
    </header>
  );
}
