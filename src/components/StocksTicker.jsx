export default function StocksTicker({ stocks }) {
  return (
    <div className="stocks-ticker-wrapper">
      <div className="ticker">
        {stocks.map((stock, index) => {
          const change = stock.regularMarketChangePercent ?? 0;
          const gainClass = change >= 0 ? 'positive' : 'negative';
          const changeSign = change >= 0 ? '+' : '';
          
          return (
            <div key={stock.symbol} className="ticker-item">
              <span className="rank">{index + 1}.</span>
              <span className="name">{stock.symbol}</span>
              <span className={`gain ${gainClass}`}>
                {changeSign}{change.toFixed(2)}%
              </span>
            </div>
          );
        })}
        {stocks.map((stock, index) => {
          const change = stock.regularMarketChangePercent ?? 0;
          const gainClass = change >= 0 ? 'positive' : 'negative';
          const changeSign = change >= 0 ? '+' : '';
          
          return (
            <div key={`${stock.symbol}-dup`} className="ticker-item">
              <span className="rank">{index + 1}.</span>
              <span className="name">{stock.symbol}</span>
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
