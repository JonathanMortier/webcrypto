export function Loading() {
  return <div className="loading">Chargement des données...</div>;
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
