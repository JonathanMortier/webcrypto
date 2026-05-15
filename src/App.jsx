import { useState, useEffect, useRef, useCallback } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { fetchCryptoData, fetchXStocks, fetchFearAndGreed, filterStablecoins, getTopGainers, calculateMarketStats } from './core/api.js';
import { REFRESH_INTERVAL } from './core/constants.js';
import { Header, CryptoGrid, CryptoTicker, StocksTicker, MarketIndicators, Loading, Error, InstallPrompt } from './components/index.js';
import { BoursePage } from './pages/index.js';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('market_cap');
  const [sortDir, setSortDir] = useState('desc');
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved || 'dark';
  });
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    const saved = localStorage.getItem('notificationsEnabled');
    return saved === 'true';
  });
  const [previousPrices, setPreviousPrices] = useState(() => {
    const saved = localStorage.getItem('previousPrices');
    return saved ? JSON.parse(saved) : {};
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };
  
  const countdownRef = useRef(null);
  const intervalRef = useRef(null);

  const notificationsRef = useRef(notificationsEnabled);
  const favoritesRef = useRef(favorites);
  const previousPricesRef = useRef(previousPrices);

  notificationsRef.current = notificationsEnabled;
  favoritesRef.current = favorites;
  previousPricesRef.current = previousPrices;

  const checkPriceAlerts = useCallback((newCryptos) => {
    if (!notificationsRef.current) return;
    
    const favoriteCryptos = newCryptos.filter(c => favoritesRef.current.includes(c.id));
    const newPrices = {};
    
    favoriteCryptos.forEach(crypto => {
      const prevPrice = previousPricesRef.current[crypto.id];
      newPrices[crypto.id] = crypto.current_price;
      
      if (prevPrice && prevPrice > 0) {
        const changePercent = ((crypto.current_price - prevPrice) / prevPrice) * 100;
        
        if (changePercent >= 5) {
          new Notification(`🚀 ${crypto.symbol.toUpperCase()} +${changePercent.toFixed(1)}%`, {
            body: `Prix: $${crypto.current_price.toLocaleString()}`,
            icon: '/favicon.ico'
          });
        } else if (changePercent <= -5) {
          new Notification(`📉 ${crypto.symbol.toUpperCase()} ${changePercent.toFixed(1)}%`, {
            body: `Prix: $${crypto.current_price.toLocaleString()}`,
            icon: '/favicon.ico'
          });
        }
      }
    });
    
    setPreviousPrices(newPrices);
  }, []);

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

      const sortedStocks = [...xstockData].sort((a, b) => (b.price_change_percentage_24h ?? 0) - (a.price_change_percentage_24h ?? 0));

      setCryptos(filtered);
      setTopGainers(gainers);
      setStocks(sortedStocks);
      setLastUpdate(new Date());
      setCountdown(REFRESH_INTERVAL);
      
      checkPriceAlerts(filtered);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [checkPriceAlerts]);

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

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('notificationsEnabled', notificationsEnabled);
}, [notificationsEnabled]);

  const toggleFavorite = useCallback((coinId) => {
    setFavorites(prev => {
      if (prev.includes(coinId)) {
        return prev.filter(id => id !== coinId);
      }
      return [...prev, coinId];
    });
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  }, []);

  const toggleNotifications = useCallback(async () => {
    if (!notificationsEnabled) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotificationsEnabled(true);
      }
    } else {
      setNotificationsEnabled(false);
    }
  }, [notificationsEnabled]);

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

  const filteredCryptos = searchQuery 
    ? cryptos.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.symbol.toLowerCase().includes(searchQuery.toLowerCase()))
    : cryptos;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT') return;
      
      if (e.key.toLowerCase() === 'r') {
        loadData();
      } else if (e.key.toLowerCase() === 'f') {
        document.querySelector('.search-input')?.focus();
      } else if (e.key.toLowerCase() === 't') {
        toggleTheme();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [loadData, toggleTheme]);

  return (
    <HashRouter>
      <CryptoTicker cryptos={topGainers} />
      <StocksTicker stocks={stocks} />
      <InstallPrompt />
      
      <div className="app">
<Header 
            onRefresh={loadData} 
            lastUpdate={lastUpdate}
            isLoading={isLoading}
            countdown={countdown}
            theme={theme}
            onThemeToggle={toggleTheme}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            favoritesCount={favorites.length}
            showFavoritesOnly={showFavoritesOnly}
            onToggleFavoritesFilter={() => setShowFavoritesOnly(prev => !prev)}
            notificationsEnabled={notificationsEnabled}
            onToggleNotifications={toggleNotifications}
          />

        <Routes>
          <Route path="/" element={
            <>
              {!isLoading && !error && (
                <MarketIndicators 
                  marketStats={marketStats}
                  fearGreed={fearGreed}
                  onSort={handleSort}
                  sortField={sortField}
                  sortDir={sortDir}
                />
              )}

              {isLoading && <Loading />}
              {error && <Error message={error} />}
              {!isLoading && !error && (
                <CryptoGrid 
                  cryptos={filteredCryptos} 
                  sortField={sortField} 
                  sortDir={sortDir}
                  favorites={favorites}
                  showFavoritesOnly={showFavoritesOnly}
                  onToggleFavorite={toggleFavorite}
                />
              )}
            </>
          } />
          <Route path="/bourse" element={<BoursePage />} />
        </Routes>
      </div>
    </HashRouter>
  );
}
