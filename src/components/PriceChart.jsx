import { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Filler } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler);

function getCSSVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

const END_LABEL = 'Maintenant';

export default function PriceChart({ prices, isPositive, timeframe = '7d', currency = '$' }) {
  const positiveColor = getCSSVar('--positive') || '#00ff88';
  const negativeColor = getCSSVar('--negative') || '#ff4444';
  const textMuted = getCSSVar('--text-muted') || '#666';
  const gridColor = getCSSVar('--card-border') || 'rgba(255, 255, 255, 0.05)';

  const lineColor = isPositive ? positiveColor : negativeColor;
  const fillColor = isPositive ? positiveColor.replace('1)', '0.1)') : negativeColor.replace('1)', '0.1)');

  const data = useMemo(() => {
    if (!prices || !Array.isArray(prices) || prices.length === 0) {
      return { labels: [], datasets: [] };
    }

    const firstItem = prices[0];
    const hasTimestamps = Array.isArray(firstItem);
    const priceValues = hasTimestamps ? prices.map(([, price]) => price) : prices;
    const timestamps = hasTimestamps ? prices.map(([ts]) => ts) : null;
    const len = priceValues.length;

    const labelIndices = new Set();
    const numLabels = Math.min(5, len);
    for (let k = 0; k < numLabels; k++) {
      labelIndices.add(Math.round((k / (numLabels - 1)) * (len - 1)));
    }

    const labels = priceValues.map((_, i) => {
      if (!labelIndices.has(i)) return '';

      if (timestamps) {
        const d = new Date(timestamps[i]);
        if (timeframe === '1h' || timeframe === '24h') {
          if (i === len - 1) return END_LABEL;
          return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        }
        if (timeframe === '7d') {
          return d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });
        }
        if (timeframe === '30d' || timeframe === '3mo') {
          return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
        }
        if (timeframe === '1y') {
          return d.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
        }
      }

      const startLabels = { '1h': '-1h', '24h': '-24h', '7d': '-7j', '30d': '-30j', '1y': '-1an' };
      if (i === 0) return startLabels[timeframe] || '-3mo';
      if (i === len - 1) return END_LABEL;
      return '';
    });

    return {
      labels,
      datasets: [
        {
          data: priceValues,
          borderColor: lineColor,
          backgroundColor: fillColor,
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 0,
          fill: true,
          tension: 0.4,
        },
      ],
    };
  }, [prices, isPositive, lineColor, fillColor, timeframe]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
    scales: {
      x: {
        display: true,
        grid: { display: false },
        ticks: {
          color: textMuted,
          font: { size: 10 },
          maxTicksLimit: 6,
        },
      },
      y: {
        display: true,
        grid: { color: gridColor },
        ticks: {
          color: textMuted,
          font: { size: 10 },
          maxTicksLimit: 6,
          callback: (value) => `${currency}${parseFloat(value).toLocaleString()}`,
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
  };

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Line data={data} options={options} />
    </div>
  );
}
