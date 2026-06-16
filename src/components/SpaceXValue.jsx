import { useState, useEffect } from 'react';
import { fetchSpaceXPrice } from '../core/api.js';
import '../styles/spacex.css';

const CACHE_KEY = 'cryptowatch_cache_spacex_price';

function readCached() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw).data;
  } catch {
    return null;
  }
}

export default function SpaceXValue() {
  const [data, setData] = useState(readCached);
  const [loading, setLoading] = useState(!data);

  useEffect(() => {
    let mounted = true;
    const fetch = () => {
      fetchSpaceXPrice()
        .then(d => { if (mounted) { setData(d); setLoading(false); } })
        .catch(e => { console.warn('SpaceX fetch error:', e); if (mounted) setLoading(false); });
    };
    fetch();
    const interval = setInterval(fetch, 300_000);
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  const gainClass = data?.change >= 0 ? 'positive' : 'negative';

  return (
    <div className={`index-card spacex-card ${data ? gainClass : ''}`}>
      <div className="spacex-icon">
        <img src="/images/spacex-logo.svg" alt="SpaceX" />
      </div>
      <div className="index-name">SpaceX</div>
      <div className="index-isin">SPCX • Nasdaq</div>
      <div className="index-price">
        {loading ? '--' : data ? `$${data.price.toFixed(2)}` : 'N/A'}
      </div>
      {data?.change != null && (
        <div className="index-change">
          <span className={gainClass}>
            {data.change >= 0 ? '+' : ''}{data.change.toFixed(2)} ({data.changePercent.toFixed(2)}%)
          </span>
        </div>
      )}
    </div>
  );
}
