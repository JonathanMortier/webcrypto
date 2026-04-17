import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchCryptoData, fetchXStocks, fetchFearAndGreed, filterStablecoins, getTopGainers, calculateMarketStats } from './core/api.js';
import { REFRESH_INTERVAL } from './core/constants.js';
import { Header, CryptoGrid, CryptoTicker, StocksTicker, MarketIndicators, Loading, Error } from './components/index.js';
import './styles/index.css';

export default function App() {
  const [cryptos, setCryptos] = useState([]);
  const [topGainers, setTopGainers] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [fearGreed, setFearGreed] = useState(null);
  const [fearGreedLoading, setFearGreedLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL);
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved || 'dark';
  });
  
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

  const loadFearGreed = useCallback(async () => {
    setFearGreedLoading(true);
    try {
      const data = await fetchFearAndGreed();
      if (data.data && data.data.length > 0) {
        setFearGreed(data.data[0]);
      }
    } catch (err) {
      console.error('Failed to load Fear & Greed:', err);
    } finally {
      setFearGreedLoading(false);
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
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  }, []);

  useEffect(() => {
    loadData();
    loadFearGreed();
    startCountdown();

    intervalRef.current = setInterval(() => {
      loadData();
    }, REFRESH_INTERVAL * 1000);

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [loadData, loadFearGreed, startCountdown]);

  const marketStats = calculateMarketStats(cryptos);

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
            theme={theme}
            onThemeToggle={toggleTheme}
          />

        {!isLoading && !error && (
          <MarketIndicators 
            marketStats={marketStats}
            fearGreed={fearGreed}
          />
        )}

        {isLoading && <Loading />}
        {error && <Error message={error} />}
        {!isLoading && !error && <CryptoGrid cryptos={cryptos} />}
      </div>
    </>
  );
}
