import { useState, useEffect } from 'react';
import { fetchCryptoData, filterStablecoins, getTopGainers } from './core/api.js';
import { MOCK_STOCK_DATA } from './core/constants.js';
import { Header, CryptoGrid, CryptoTicker, StocksTicker, Loading, Error } from './components/index.js';
import './styles/index.css';

export default function App() {
  const [cryptos, setCryptos] = useState([]);
  const [topGainers, setTopGainers] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchCryptoData();
      const filtered = filterStablecoins(data);
      const gainers = getTopGainers(filtered);

      setCryptos(filtered);
      setTopGainers(gainers);
      setStocks(MOCK_STOCK_DATA);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <>
      <CryptoTicker cryptos={topGainers} />
      <StocksTicker stocks={stocks} />
      
      <div className="app">
        <Header 
          onRefresh={loadData} 
          lastUpdate={lastUpdate}
          isLoading={isLoading}
        />

        {isLoading && <Loading />}
        {error && <Error message={error} />}
        {!isLoading && !error && <CryptoGrid cryptos={cryptos} />}
      </div>
    </>
  );
}
