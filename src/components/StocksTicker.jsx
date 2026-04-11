import { XSTOCK_IMAGES } from '../core/imageCache.js';

export default function StocksTicker({ stocks }) {
  return (
    <div className="stocks-ticker-wrapper">
      <div className="ticker">
        {stocks.map((stock, index) => {
          const change = stock.price_change_percentage_24h ?? 0;
          const gainClass = change >= 0 ? 'positive' : 'negative';
          const changeSign = change >= 0 ? '+' : '';
          const imageUrl = XSTOCK_IMAGES[stock.id] || stock.image;
          
          return (
            <div key={stock.id} className="ticker-item">
              <span className="rank">{index + 1}.</span>
              <img src={imageUrl} alt={stock.name} style={{ width: 24, height: 24, borderRadius: '50%' }} />
              <span className="name">{stock.symbol.toUpperCase()}</span>
              <span className={`gain ${gainClass}`}>
                {changeSign}{change.toFixed(2)}%
              </span>
            </div>
          );
        })}
        {stocks.map((stock, index) => {
          const change = stock.price_change_percentage_24h ?? 0;
          const gainClass = change >= 0 ? 'positive' : 'negative';
          const changeSign = change >= 0 ? '+' : '';
          const imageUrl = XSTOCK_IMAGES[stock.id] || stock.image;
          
          return (
            <div key={`${stock.id}-dup`} className="ticker-item">
              <span className="rank">{index + 1}.</span>
              <img src={imageUrl} alt={stock.name} style={{ width: 24, height: 24, borderRadius: '50%' }} />
              <span className="name">{stock.symbol.toUpperCase()}</span>
              <span className={`gain ${gainClass}`}>
                {changeSign}{change.toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
