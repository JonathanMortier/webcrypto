import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchCoinDetail, fetchCoinHistory } from '../core/api.js';
import { Loading, Error } from '../components/index.js';
import CoinDetailContent from '../components/CoinDetailContent.jsx';

export default function CoinDetailPage() {
  const { coinId } = useParams();
  const navigate = useNavigate();

  const [coin, setCoin] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [timeframe, setTimeframe] = useState('7d');
  const [chartData, setChartData] = useState([]);
  const [chartLoading, setChartLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchCoinDetail(coinId);
        setCoin(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [coinId]);

  useEffect(() => {
    const loadChart = async () => {
      setChartLoading(true);
      try {
        const daysMap = { '1h': 1, '24h': 1, '7d': 7, '30d': 30, '1y': 365 };
        const days = daysMap[timeframe] || 7;
        const data = await fetchCoinHistory(coinId, days);
        if (data.prices) {
          setChartData(data.prices);
        }
      } catch (err) {
        console.error('Failed to load chart:', err);
      } finally {
        setChartLoading(false);
      }
    };
    loadChart();
  }, [timeframe, coinId]);

  let body;
  if (isLoading) {
    body = <Loading />;
  } else if (error) {
    body = <Error message={error} onRetry={() => window.location.reload()} />;
  } else if (coin) {
    body = <CoinDetailContent coin={coin} timeframe={timeframe} setTimeframe={setTimeframe} chartData={chartData} chartLoading={chartLoading} />;
  } else {
    body = null;
  }

  return (
    <div className="coin-detail-page">
      <div className="coin-detail-header">
        <button className="coin-detail-back" onClick={() => navigate(-1)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Retour
        </button>
        {coin && (
          <a
            href={`https://www.coingecko.com/en/coins/${coin.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="coin-detail-external"
            title="Voir sur CoinGecko"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
        )}
      </div>

      {body}
    </div>
  );
}
