import { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler);

export default function PriceChart({ prices, isPositive }) {
  const data = useMemo(() => {
    const labels = prices.map(([timestamp]) => {
      const date = new Date(timestamp);
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    });

    const priceValues = prices.map(([, price]) => price);

    return {
      labels,
      datasets: [
        {
          data: priceValues,
          borderColor: isPositive ? '#00ff88' : '#ff4444',
          backgroundColor: isPositive 
            ? 'rgba(0, 255, 136, 0.1)' 
            : 'rgba(255, 68, 68, 0.1)',
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 0,
          fill: true,
          tension: 0.4,
        },
      ],
    };
  }, [prices, isPositive]);

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
          color: '#666',
          font: { size: 10 },
          maxTicksLimit: 6,
        },
      },
      y: {
        display: true,
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: {
          color: '#666',
          font: { size: 10 },
          callback: (value) => `$${value.toLocaleString()}`,
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
