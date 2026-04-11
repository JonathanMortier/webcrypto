import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchCryptoData, fetchXStocks, filterStablecoins, getTopGainers } from './core/api.js';
import { REFRESH_INTERVAL } from './core/constants.js';
import { Header, CryptoGrid, CryptoTicker, StocksTicker, Loading, Error } from './components/index.js';
import './styles/index.css';

export default function App() {
  const [cryptos, setCryptos] = useState([]);
  const [topGainers, setTopGainers] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL);
  
  const countdownRef = useRef(null);
  const intervalRef = useRef(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [cryptoData, xstockData] = await Promise.all([
        fetchCryptoData(),
        fetchXStocks()
      ]);
      
      const filtered = filterStablecoins(cryptoData);
      const gainers = getTopGainers(filtered);

      setCryptos(filtered);
      setTopGainers(gainers);
      setStocks(xstockData);
      setLastUpdate(new Date());
      setCountdown(REFRESH_INTERVAL);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const startCountdown = useCallback(() => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          return REFRESH_INTERVAL;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    loadData();
    startCountdown();

    intervalRef.current = setInterval(() => {
      loadData();
    }, REFRESH_INTERVAL * 1000);

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [loadData, startCountdown]);

  return (
    <>
      <CryptoTicker cryptos={topGainers} />
      <StocksTicker stocks={stocks} />
      
      <div className="app">
        <Header 
          onRefresh={loadData} 
          lastUpdate={lastUpdate}
          isLoading={isLoading}
          countdown={countdown}
        />

        {isLoading && <Loading />}
        {error && <Error message={error} />}
        {!isLoading && !error && <CryptoGrid cryptos={cryptos} />}
      </div>
    </>
  );
}
