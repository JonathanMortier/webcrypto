import { useState, useEffect } from 'react';
import { fetchSpaceXPrice } from '../core/api.js';
import '../styles/spacex.css';

export default function SpaceXValue() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchSpaceXPrice()
      .then(setData)
      .catch(() => setError(true));
  }, []);

  if (error || !data) return null;

  const gainClass = data.change >= 0 ? 'positive' : 'negative';

  return (
    <div className={`index-card spacex-card ${gainClass}`}>
      <div className="spacex-icon">
        <img src="/images/spacex-logo.svg" alt="SpaceX" />
      </div>
      <div className="index-name">SpaceX</div>
      <div className="index-isin">SPCX • Nasdaq</div>
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
