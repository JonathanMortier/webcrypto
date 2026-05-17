import { useState, useEffect } from 'react';
import { fetchEtfData } from '../core/api.js';
import { Loading, Error } from '../components/Status.jsx';
import CryptoGrid from '../components/CryptoGrid.jsx';

export default function EtfPage({ searchQuery }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEtfData()
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  if (loading) return <Loading />;
  if (error) return <div className="error">{error}</div>;
  if (!data?.length) return <div className="empty-state">Aucun ETF</div>;

  return <CryptoGrid cryptos={data} sortField="current_price" sortDir="desc" isEtf={true} />;
}