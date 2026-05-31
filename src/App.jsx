import { useState, useEffect, useRef, useCallback } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { fetchCryptoData, fetchXStocks, fetchFearAndGreed, filterStablecoins, getTopGainers, calculateMarketStats } from './core/api.js';
import { REFRESH_INTERVAL, ALERT_THRESHOLD } from './core/constants.js';
import { Header, CryptoGrid, CryptoTicker, StocksTicker, MarketIndicators, Loading, Error, InstallPrompt } from './components/index.js';
import { BoursePage } from './pages/index.js';
import { Analytics } from '@vercel/analytics/react';
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
    if (saved === 'true') {
      if (typeof Notification !== 'undefined' && Notification.permission !== 'granted') {
        localStorage.setItem('notificationsEnabled', 'false');
        return false;
      }
      return true;
    }
    return false;
  });
  const [previousPrices, setPreviousPrices] = useState(() => {
    const saved = localStorage.getItem('previousPrices');
    return saved ? JSON.parse(saved) : {};
  });
  const [priceSnapshotDate, setPriceSnapshotDate] = useState(() => {
    return localStorage.getItem('priceSnapshotDate') || '';
  });
  const [lastAlertPrices, setLastAlertPrices] = useState(() => {
    const saved = localStorage.getItem('lastAlertPrices');
    return saved ? JSON.parse(saved) : {};
  });
  const [notificationMessage, setNotificationMessage] = useState(null);

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
  const priceSnapshotDateRef = useRef(priceSnapshotDate);
  const lastAlertPricesRef = useRef(lastAlertPrices);

  notificationsRef.current = notificationsEnabled;
  favoritesRef.current = favorites;
  previousPricesRef.current = previousPrices;
  priceSnapshotDateRef.current = priceSnapshotDate;
  lastAlertPricesRef.current = lastAlertPrices;

  const checkPriceAlerts = useCallback((newCryptos) => {
    if (!notificationsRef.current) return;
    
    const favoriteCryptos = newCryptos.filter(c => favoritesRef.current.includes(c.id));
    const newPrices = {};
    const alertedIds = [];
    const alertsUp = [];
    const alertsDown = [];
    
    favoriteCryptos.forEach(crypto => {
      const prevPrice = previousPricesRef.current[crypto.id];
      newPrices[crypto.id] = crypto.current_price;
      
      if (prevPrice && prevPrice > 0) {
        const changePercent = ((crypto.current_price - prevPrice) / prevPrice) * 100;
        
        if (Math.abs(changePercent) < ALERT_THRESHOLD) return;

        const lastAlerted = lastAlertPricesRef.current[crypto.id];
        if (lastAlerted) {
          const alertChange = Math.abs((crypto.current_price - lastAlerted) / lastAlerted) * 100;
          if (alertChange < ALERT_THRESHOLD) return;
        }

        const sign = changePercent >= 0 ? '+' : '';
        const line = `${crypto.symbol.toUpperCase()}: ${sign}${changePercent.toFixed(1)}% ($${crypto.current_price.toLocaleString()})`;
        alertedIds.push({ id: crypto.id, price: crypto.current_price });

        if (changePercent >= ALERT_THRESHOLD) {
          alertsUp.push(line);
        } else {
          alertsDown.push(line);
        }
      }
    });

    if (alertedIds.length > 0) {
      const lines = [];
      if (alertsUp.length > 0) {
        lines.push('🚀 Hausse', ...alertsUp);
      }
      if (alertsDown.length > 0) {
        lines.push('📉 Baisse', ...alertsDown);
      }

      const title = alertedIds.length === 1
        ? lines[1]
        : `🔔 ${alertedIds.length} alerte${alertedIds.length > 1 ? 's' : ''} de prix`;
      const body = alertedIds.length === 1
        ? lines[0]
        : lines.join('\n');

      new Notification(title, { body, icon: '/favicon.ico' });

      const newAlerted = { ...lastAlertPricesRef.current };
      alertedIds.forEach(({ id, price }) => { newAlerted[id] = price; });
      setLastAlertPrices(newAlerted);
    }
    
    const today = new Date().toDateString();
    if (!priceSnapshotDateRef.current || priceSnapshotDateRef.current !== today) {
      setPreviousPrices(newPrices);
      setPriceSnapshotDate(today);
      setLastAlertPrices({});
    }
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
      const withRank = filtered.map((coin, index) => ({ ...coin, display_rank: index + 1 }));
      const gainers = getTopGainers(withRank);

      const sortedStocks = [...xstockData].sort((a, b) => (b.price_change_percentage_24h ?? 0) - (a.price_change_percentage_24h ?? 0));

      setCryptos(withRank);
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

  useEffect(() => {
    localStorage.setItem('previousPrices', JSON.stringify(previousPrices));
  }, [previousPrices]);

  useEffect(() => {
    localStorage.setItem('priceSnapshotDate', priceSnapshotDate);
  }, [priceSnapshotDate]);

  useEffect(() => {
    localStorage.setItem('lastAlertPrices', JSON.stringify(lastAlertPrices));
  }, [lastAlertPrices]);

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
        setNotificationMessage(null);
      } else if (permission === 'denied') {
        setNotificationMessage('Notifications refusées par le navigateur. Modifiez les paramètres de votre navigateur pour les réactiver.');
      } else {
        setNotificationMessage('Permission de notification non accordée. Réessayez ou vérifiez les paramètres de votre navigateur.');
      }
    } else {
      setNotificationsEnabled(false);
      setNotificationMessage(null);
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

        {notificationMessage && (
          <div className="notification-toast">
            <span>{notificationMessage}</span>
            <button className="notification-toast-close" onClick={() => setNotificationMessage(null)}>×</button>
          </div>
        )}
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
              {error && <Error message={error} onRetry={loadData} />}
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
      <Analytics />
    </HashRouter>
  );
}
