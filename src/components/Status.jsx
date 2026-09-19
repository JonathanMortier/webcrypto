export function Loading() {
  return <div className="loading">Chargement des données...</div>;
}

export function CardSkeletonGrid({ count = 12 }) {
  return (
    <div className="crypto-grid" role="status" aria-busy="true">
      <span className="sr-only">Chargement des données...</span>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="crypto-card csk-card" aria-hidden="true">
          <div className="csk-block csk-icon" />
          <div className="csk-block csk-line csk-name" />
          <div className="csk-block csk-line csk-price" />
          <div className="csk-block csk-line csk-bar" />
          <div className="csk-stats">
            <div className="csk-block csk-line" />
            <div className="csk-block csk-line" />
            <div className="csk-block csk-line" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function Error({ message, onRetry }) {
  return (
    <div className="error">
      <div>{message || 'Une erreur est survenue. Veuillez réessayer dans quelques instants.'}</div>
      {onRetry && (
        <button className="retry-btn" onClick={onRetry}>
          Réessayer
        </button>
      )}
    </div>
  );
}
