import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import IndexChart from '../components/IndexChart.jsx';
import { fetchIndexHistory } from '../core/api.js';

vi.mock('../core/api.js', async (importOriginal) => {
  const original = await importOriginal();
  return {
    ...original,
    fetchIndexHistory: vi.fn(),
  };
});

vi.mock('../components/PriceChart.jsx', () => ({
  default: ({ prices, isPositive, timeframe, currency }) => (
    <div data-testid="price-chart">
      <span data-testid="chart-currency">{currency}</span>
      <span data-testid="chart-positive">{String(isPositive)}</span>
      <span data-testid="chart-points">{prices.length}</span>
      <span data-testid="chart-timeframe">{timeframe}</span>
    </div>
  ),
}));

describe('IndexChart', () => {
  beforeEach(() => {
    fetchIndexHistory.mockReset();
  });

  it('should show loading state initially', () => {
    fetchIndexHistory.mockReturnValue(new Promise(() => {}));
    render(<IndexChart symbol="^GSPC" currency="$" />);
    expect(screen.getByText('Chargement...')).toBeInTheDocument();
  });

  it('should render a positive chart when last price >= first', async () => {
    fetchIndexHistory.mockResolvedValue([
      [1700000000000, 5000],
      [1700086400000, 5500],
    ]);
    render(<IndexChart symbol="^GSPC" currency="$" />);
    await screen.findByTestId('price-chart');
    expect(screen.getByTestId('chart-currency')).toHaveTextContent('$');
    expect(screen.getByTestId('chart-positive')).toHaveTextContent('true');
    expect(screen.getByTestId('chart-points')).toHaveTextContent('2');
    expect(screen.getByTestId('chart-timeframe')).toHaveTextContent('3mo');
  });

  it('should render a negative chart when price declined', async () => {
    fetchIndexHistory.mockResolvedValue([
      [1700000000000, 5500],
      [1700086400000, 5000],
    ]);
    render(<IndexChart symbol="^FCHI" currency="€" />);
    await screen.findByTestId('price-chart');
    expect(screen.getByTestId('chart-currency')).toHaveTextContent('€');
    expect(screen.getByTestId('chart-positive')).toHaveTextContent('false');
  });

  it('should show unavailable state when fetch fails', async () => {
    fetchIndexHistory.mockRejectedValue(new Error('boom'));
    render(<IndexChart symbol="^GSPC" currency="$" />);
    await waitFor(() => {
      expect(screen.getByText('Graphique indisponible')).toBeInTheDocument();
    });
  });
});
