import { useState, useEffect } from 'react';
import { lazy, Suspense } from 'react';
import { fetchIndexHistory } from '../core/api.js';

const PriceChart = lazy(() => import('./PriceChart.jsx'));

export default function IndexChart({ symbol, currency }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchIndexHistory(symbol)
      .then((points) => {
        if (!cancelled) setData(points);
      })
      .catch(() => {
        if (!cancelled) setData([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [symbol]);

  if (loading) return <div className="index-chart-loading">Chargement...</div>;

  if (!data || data.length === 0) {
    return <div className="index-chart-empty">Graphique indisponible</div>;
  }

  const first = data[0][1];
  const last = data[data.length - 1][1];
  const isPositive = last >= first;

  return (
    <div className="index-chart">
      <Suspense fallback={<div className="index-chart-loading">Chargement...</div>}>
        <PriceChart prices={data} isPositive={isPositive} timeframe="3mo" currency={currency} />
      </Suspense>
    </div>
  );
}
