import { useState, useEffect } from 'react';
import { fetchXStocks, fetchIndicesData } from '../core/api.js';
import { Loading, Error } from '../components/Status.jsx';
import CryptoGrid from '../components/CryptoGrid.jsx';
import GoldPrice from '../components/GoldPrice.jsx';

const HOLDINGS_KEY = 'indices_holdings';

function loadHoldings() {
  try {
    const saved = localStorage.getItem(HOLDINGS_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

function saveHoldings(holdings) {
  localStorage.setItem(HOLDINGS_KEY, JSON.stringify(holdings));
}

function formatCurrency(n) {
  if (n == null || isNaN(n)) return '-';
  return n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function BoursePage() {
  const [stocks, setStocks] = useState(null);
  const [indices, setIndices] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [holdings, setHoldings] = useState(loadHoldings);

  useEffect(() => {
    fetchIndicesData()
      .then(data => setIndices(data))
      .catch(e => { console.warn('Indices error:', e); setLoading(false); });

    fetchXStocks()
      .then(data => {
        const sorted = [...data].sort((a, b) => (b.price_change_percentage_24h ?? 0) - (a.price_change_percentage_24h ?? 0));
        setStocks(sorted);
        setLoading(false);
      })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  const updateHolding = (id, field, value) => {
    setHoldings(prev => {
      const next = { ...prev, [id]: { ...prev[id], [field]: value } };
      saveHoldings(next);
      return next;
    });
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;
  if (!stocks?.length) return <div className="empty-state">Aucune action disponible</div>;

  return (
    <>
      {indices && (
        <div className="indices-grid">
          {indices.map(idx => {
            const holding = holdings[idx.id] || {};
            const units = holding.units;
            const avgPrice = holding.avgPrice;
            const currPrice = idx.price;
            const invested = units && avgPrice ? units * avgPrice : null;
            const currentValue = units && currPrice != null ? units * currPrice : null;
            const gainTotal = invested != null && currentValue != null ? currentValue - invested : null;
            const gainPercent = invested && invested > 0 ? ((currentValue - invested) / invested) * 100 : null;
            const gainClass = gainTotal != null ? (gainTotal >= 0 ? 'positive' : 'negative') : '';

            return (
              <div key={idx.id} className={`index-card ${gainClass}`}>
                <div className="index-name">{idx.name}</div>
                <div className="index-isin">{idx.isin}</div>
                <div className="index-price">
                  {currPrice != null ? `${currPrice.toFixed(2)} €` : 'N/A'}
                </div>
                {idx.change != null && (
                  <div className="index-change">
                    <span className={idx.change >= 0 ? 'positive' : 'negative'}>
                      {idx.change >= 0 ? '+' : ''}{idx.change.toFixed(2)} ({idx.changePercent.toFixed(2)}%)
                    </span>
                  </div>
                )}

                <div className="holding-fields">
                  <label className="holding-field">
                    <span>Units</span>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      placeholder="0"
                      value={units ?? ''}
                      onChange={e => updateHolding(idx.id, 'units', e.target.value === '' ? null : parseFloat(e.target.value))}
                    />
                  </label>
                  <label className="holding-field">
                    <span>Prix moy.</span>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      placeholder="0"
                      value={avgPrice ?? ''}
                      onChange={e => updateHolding(idx.id, 'avgPrice', e.target.value === '' ? null : parseFloat(e.target.value))}
                    />
                  </label>
                </div>

                {invested != null && (
                  <div className="holding-summary">
                    <div className="holding-row">
                      <span>Investi</span>
                      <span>{formatCurrency(invested)} €</span>
                    </div>
                    <div className="holding-row">
                      <span>Val. actuelle</span>
                      <span>{formatCurrency(currentValue)} €</span>
                    </div>
                    <div className={`holding-row gain-row ${gainClass}`}>
                      <span>Gain/Pert</span>
                      <span>
                        {gainTotal >= 0 ? '+' : ''}{formatCurrency(Math.abs(gainTotal))} €
                        {gainPercent != null && ` (${gainPercent >= 0 ? '+' : ''}${gainPercent.toFixed(2)}%)`}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="section-divider" />
      <CryptoGrid cryptos={stocks} sortField="current_price" sortDir="desc" isEtf={false} hideRank={true} />

      <div className="section-divider" />
      <div className="gold-section">
        <GoldPrice />
      </div>
    </>
  );
}
