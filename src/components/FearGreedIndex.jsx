import { useState, useEffect } from 'react';

export default function FearGreedIndex({ fearGreedData, isLoading, onRefresh }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getClassification = (value) => {
    if (value <= 25) return { text: 'Extreme Fear', color: '#ff4444', icon: '😱' };
    if (value <= 45) return { text: 'Fear', color: '#ff9933', icon: '😰' };
    if (value <= 55) return { text: 'Neutral', color: '#ffcc00', icon: '😐' };
    if (value <= 75) return { text: 'Greed', color: '#99cc33', icon: '😊' };
    return { text: 'Extreme Greed', color: '#00ff88', icon: '🤑' };
  };

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  if (!isExpanded) {
    return (
      <div className="fear-greed-container">
        <button 
          className="fear-greed-toggle"
          onClick={handleToggle}
          aria-label="Toggle Fear & Greed Index"
        >
          F&G
        </button>
      </div>
    );
  }

  const classification = fearGreedData ? getClassification(parseInt(fearGreedData.value)) : null;

  return (
    <div className="fear-greed-container">
      <button 
        className="fear-greed-toggle"
        onClick={handleToggle}
        aria-label="Toggle Fear & Greed Index"
      >
        ✕
      </button>

      <div className="fear-greed-content">
        <div className="fear-greed-header">
          <span className="fear-greed-title">Fear & Greed</span>
          <button 
            className="fear-greed-refresh"
            onClick={onRefresh}
            disabled={isLoading}
            aria-label="Refresh"
          >
            ↻
          </button>
        </div>
        <div className="fear-greed-source">Alternative.me</div>

        {isLoading ? (
          <div className="fear-greed-loading">
            <div className="skeleton skeleton-value"></div>
            <div className="skeleton skeleton-text"></div>
          </div>
        ) : fearGreedData ? (
          <>
            <div className="fear-greed-value" style={{ color: classification.color }}>
              <span className="fear-greed-number">{fearGreedData.value}</span>
              <span className="fear-greed-icon">{classification.icon}</span>
            </div>
            <div 
              className="fear-greed-classification"
              style={{ color: classification.color }}
            >
              {classification.text}
            </div>
            <div className="fear-greed-bar">
              <div 
                className="fear-greed-bar-fill"
                style={{ 
                  width: `${fearGreedData.value}%`,
                  backgroundColor: classification.color
                }}
              ></div>
            </div>
          </>
        ) : (
          <div className="fear-greed-error">Erreur de chargement</div>
        )}
      </div>
    </div>
  );
}
