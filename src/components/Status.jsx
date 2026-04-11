export function Loading() {
  return <div className="loading">Chargement des données...</div>;
}

export function Error({ message }) {
  return (
    <div className="error">
      {message || 'Une erreur est survenue. Veuillez réessayer dans quelques instants.'}
    </div>
  );
}
