import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import BoursePage from '../pages/BoursePage.jsx';

const mockIndices = [
  { id: 'sp500', name: 'S&P 500', symbol: 'PSPH.PA', isin: 'FR0011871136', price: 5500, change: 25, changePercent: 0.46 },
  { id: 'nasdaq', name: 'Nasdaq 100', symbol: 'SXRV.DE', isin: 'IE00B53SZB19', price: 18000, change: -50, changePercent: -0.28 },
  { id: 'eurostoxx', name: 'Euro Stoxx 600', symbol: 'ETSZ.DE', isin: 'FR0011550193', price: 520, change: 3.5, changePercent: 0.68 },
  { id: 'msci-world', name: 'MSCI World', symbol: 'EUNL.DE', isin: 'IE00B4L5Y983', price: 350, change: 2.1, changePercent: 0.60 },
];

const mockStocks = [
  {
    id: 'apple-xstock', symbol: 'aapl', name: 'Apple',
    current_price: 178, price_change_percentage_24h: 1.5,
    market_cap: 2800000000000, image: 'https://example.com/aapl.png',
    sparkline_in_7d: { price: [] },
  },
  {
    id: 'microsoft-xstock', symbol: 'msft', name: 'Microsoft',
    current_price: 420, price_change_percentage_24h: -0.3,
    market_cap: 3100000000000, image: 'https://example.com/msft.png',
    sparkline_in_7d: { price: [] },
  },
];

const { mockFetchIndicesData, mockFetchXStocks, mockFetchGoldPrice } = vi.hoisted(() => ({
  mockFetchIndicesData: vi.fn(),
  mockFetchXStocks: vi.fn(),
  mockFetchGoldPrice: vi.fn(),
}));

vi.mock('../core/api.js', async (importOriginal) => {
  const original = await importOriginal();
  return {
    ...original,
    fetchIndicesData: mockFetchIndicesData,
    fetchXStocks: mockFetchXStocks,
    fetchGoldPrice: mockFetchGoldPrice,
  };
});

vi.mock('../components/CryptoCard.jsx', () => ({
  default: ({ coin }) => <div data-testid="crypto-card">{coin.name}</div>,
}));

vi.mock('../core/imageCache.js', async (importOriginal) => {
  const original = await importOriginal();
  return {
    ...original,
    getImageUrl: vi.fn((id, url) => url),
  };
});

beforeEach(() => {
  mockFetchIndicesData.mockResolvedValue(mockIndices);
  mockFetchXStocks.mockResolvedValue(mockStocks);
  mockFetchGoldPrice.mockRejectedValue(new Error('mock'));
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('BoursePage', () => {
  it('should show loading state initially', () => {
    mockFetchXStocks.mockImplementation(() => new Promise(() => {}));
    render(<BoursePage />);
    expect(screen.getByText('Chargement des données...')).toBeInTheDocument();
  });

  it('should render indices cards with prices after loading', async () => {
    render(<BoursePage />);
    await waitFor(() => {
      expect(screen.getByText('S&P 500')).toBeInTheDocument();
    }, { timeout: 3000 });
    expect(screen.getByText('Nasdaq 100')).toBeInTheDocument();
    expect(screen.getByText('Euro Stoxx 600')).toBeInTheDocument();
    expect(screen.getByText('MSCI World')).toBeInTheDocument();
  });

  it('should render index prices in euros', async () => {
    render(<BoursePage />);
    await waitFor(() => {
      expect(screen.getAllByText(/€/).length).toBeGreaterThanOrEqual(4);
    }, { timeout: 3000 });
    expect(screen.getByText('5500.00 €')).toBeInTheDocument();
    expect(screen.getByText('18000.00 €')).toBeInTheDocument();
    expect(screen.getByText('520.00 €')).toBeInTheDocument();
    expect(screen.getByText('350.00 €')).toBeInTheDocument();
  });

  it('should render index ISIN codes', async () => {
    render(<BoursePage />);
    await waitFor(() => {
      expect(screen.getByText('FR0011871136')).toBeInTheDocument();
    }, { timeout: 3000 });
    expect(screen.getByText('IE00B53SZB19')).toBeInTheDocument();
  });

  it('should render index change with positive/negative signs', async () => {
    render(<BoursePage />);
    await waitFor(() => {
      expect(screen.getByText('+25.00 (0.46%)')).toBeInTheDocument();
    }, { timeout: 3000 });
    expect(screen.getByText('-50.00 (-0.28%)')).toBeInTheDocument();
  });

  it('should render stock grid after loading', async () => {
    render(<BoursePage />);
    await waitFor(() => {
      const cards = screen.getAllByTestId('crypto-card');
      expect(cards.length).toBe(2);
    }, { timeout: 3000 });
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.getByText('Microsoft')).toBeInTheDocument();
  });

  it('should show error state when fetch fails', async () => {
    mockFetchXStocks.mockRejectedValue(new Error('Erreur de récupération'));

    render(<BoursePage />);
    await waitFor(() => {
      expect(screen.getByText(/Erreur de récupération/)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('should render portfolio input fields for holdings', async () => {
    render(<BoursePage />);
    await waitFor(() => {
      expect(screen.getAllByPlaceholderText('0').length).toBeGreaterThan(0);
    }, { timeout: 3000 });
  });

  it('should render gold price card when fetch succeeds', async () => {
    mockFetchGoldPrice.mockResolvedValue({ price: 4360.50, change: 25.30, changePercent: 0.58 });

    render(<BoursePage />);
    await waitFor(() => {
      expect(screen.getByText('Gold (XAU)')).toBeInTheDocument();
    }, { timeout: 3000 });
    expect(screen.getByText('$4360.50')).toBeInTheDocument();
    expect(screen.getByText('+25.30 (0.58%)')).toBeInTheDocument();
  });

  it('should hide gold card on fetch error', async () => {
    mockFetchGoldPrice.mockRejectedValue(new Error('API error'));

    render(<BoursePage />);
    await waitFor(() => {
      expect(screen.getByText('S&P 500')).toBeInTheDocument();
    }, { timeout: 3000 });
    expect(screen.queryByText('Gold (XAU)')).not.toBeInTheDocument();
  });
});
