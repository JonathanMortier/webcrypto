import { useState, useEffect } from 'react';
import { fetchXStocks } from '../core/api.js';
import { Loading, Error } from '../components/Status.jsx';
import CryptoGrid from '../components/CryptoGrid.jsx';

export default function BoursePage() {
  const [stocks, setStocks] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchXStocks()
      .then(data => {
        const sorted = [...data].sort((a, b) => (b.price_change_percentage_24h ?? 0) - (a.price_change_percentage_24h ?? 0));
        setStocks(sorted);
        setLoading(false);
      })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;
  if (!stocks?.length) return <div className="empty-state">Aucune action disponible</div>;

  return <CryptoGrid cryptos={stocks} sortField="current_price" sortDir="desc" isEtf={false} />;
}
