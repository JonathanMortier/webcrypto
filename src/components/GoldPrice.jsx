import { useState, useEffect } from 'react';
import { fetchGoldPrice } from '../core/api.js';
import '../styles/goldPrice.css';

export default function GoldPrice() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchGoldPrice()
      .then(setData)
      .catch(() => setError(true));
  }, []);

  if (error || !data) return null;

  const gainClass = data.change >= 0 ? 'positive' : 'negative';

  return (
    <div className={`index-card gold-card ${gainClass}`}>
      <div className="gold-icon" />
      <div className="index-name">Gold (XAU)</div>
      <div className="index-isin">XAU/USD • troy oz</div>
      <div className="index-price">${data.price.toFixed(2)}</div>
      {data.change != null && (
        <div className="index-change">
          <span className={gainClass}>
            {data.change >= 0 ? '+' : ''}{data.change.toFixed(2)} ({data.changePercent.toFixed(2)}%)
          </span>
        </div>
      )}
    </div>
  );
}
