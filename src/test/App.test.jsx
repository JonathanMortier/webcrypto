import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import App from '../App.jsx';

const mockCryptos = [
  {
    id: 'bitcoin', symbol: 'btc', name: 'Bitcoin',
    current_price: 65000, market_cap: 1270000000000, market_cap_rank: 1,
    total_volume: 45000000000, price_change_percentage_24h: 2.5,
    ath: 69000, image: 'https://example.com/btc.png',
    sparkline_in_7d: { price: [63000, 64000, 64500] },
  },
  {
    id: 'ethereum', symbol: 'eth', name: 'Ethereum',
    current_price: 3500, market_cap: 420000000000, market_cap_rank: 2,
    total_volume: 20000000000, price_change_percentage_24h: -1.2,
    ath: 4800, image: 'https://example.com/eth.png',
    sparkline_in_7d: { price: [3450, 3480, 3500] },
  },
  {
    id: 'tether', symbol: 'usdt', name: 'Tether',
    current_price: 1, market_cap: 95000000000, market_cap_rank: 3,
    total_volume: 50000000000, price_change_percentage_24h: 0.01,
    ath: 1, image: 'https://example.com/usdt.png',
    sparkline_in_7d: { price: [1, 1, 1] },
  },
  {
    id: 'solana', symbol: 'sol', name: 'Solana',
    current_price: 145, market_cap: 65000000000, market_cap_rank: 5,
    total_volume: 3000000000, price_change_percentage_24h: 5.0,
    ath: 260, image: 'https://example.com/sol.png',
    sparkline_in_7d: { price: [140, 142, 145] },
  },
];

const mockStocks = [
  {
    id: 'apple-xstock', symbol: 'aapl', name: 'Apple',
    current_price: 178, price_change_percentage_24h: 1.5,
    market_cap: 2800000000000, image: 'https://example.com/aapl.png',
    sparkline_in_7d: { price: [] },
  },
  {
    id: 'nvidia-xstock', symbol: 'nvda', name: 'NVIDIA',
    current_price: 880, price_change_percentage_24h: -0.8,
    market_cap: 2200000000000, image: 'https://example.com/nvda.png',
    sparkline_in_7d: { price: [] },
  },
];

const mockFearGreed = { data: [{ value: '55', value_classification: 'Neutral' }] };

const { mockFetchCryptoData, mockFetchXStocks, mockFetchFearAndGreed } = vi.hoisted(() => ({
  mockFetchCryptoData: vi.fn(),
  mockFetchXStocks: vi.fn(),
  mockFetchFearAndGreed: vi.fn(),
}));

vi.mock('../core/api.js', async (importOriginal) => {
  const original = await importOriginal();
  return {
    ...original,
    fetchCryptoData: mockFetchCryptoData,
    fetchXStocks: mockFetchXStocks,
    fetchFearAndGreed: mockFetchFearAndGreed,
  };
});

vi.mock('../core/weatherApi.js', () => ({
  detectLocation: vi.fn().mockResolvedValue({ lat: 48.85, lon: 2.35 }),
  fetchWeather: vi.fn().mockResolvedValue({ temp: 22, condition: 'Sunny', icon: '//cdn.weatherapi.com/weather/64x64/day/113.png', city: 'Paris', country: 'France' }),
}));

vi.mock('../core/imageCache.js', async (importOriginal) => {
  const original = await importOriginal();
  return {
    ...original,
    getImageUrl: vi.fn((id, url) => url),
  };
});

beforeEach(() => {
  mockFetchCryptoData.mockResolvedValue(mockCryptos);
  mockFetchXStocks.mockResolvedValue(mockStocks);
  mockFetchFearAndGreed.mockResolvedValue(mockFearGreed);
  localStorage.clear();
  vi.stubGlobal('Notification', { requestPermission: vi.fn(), permission: 'default' });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe('App - Dashboard integration', () => {
  it('should render the header with title', async () => {
    render(<App />);
    expect(screen.getByText('CryptoWatch')).toBeInTheDocument();
  });

  it('should render the top gainers ticker after loading', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getAllByText('SOL').length).toBeGreaterThan(0);
    }, { timeout: 3000 });
  });

  it('should render the stocks ticker after loading', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getAllByText('AAPL').length).toBeGreaterThan(0);
    }, { timeout: 3000 });
  });

  it('should render crypto cards with names after loading', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('Bitcoin')).toBeInTheDocument();
    }, { timeout: 3000 });
    expect(screen.getByText('Ethereum')).toBeInTheDocument();
    expect(screen.getByText('Solana')).toBeInTheDocument();
  });

  it('should filter out stablecoins (USDT should not appear)', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('Bitcoin')).toBeInTheDocument();
    }, { timeout: 3000 });
    expect(screen.queryByText('Tether')).not.toBeInTheDocument();
  });

  it('should display display_rank instead of market_cap_rank', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('Bitcoin')).toBeInTheDocument();
    }, { timeout: 3000 });
    expect(screen.getByText('#1')).toBeInTheDocument();
  });

  it('should render market indicators section', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getAllByText('Market Cap').length).toBeGreaterThanOrEqual(1);
    }, { timeout: 3000 });
    expect(screen.getAllByText('Volume 24h').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Change 24h').length).toBeGreaterThanOrEqual(1);
  });

  it('should render price formatted correctly', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('$65,000.00')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('should render market cap formatted correctly', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('$1.27T')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('should show loading state initially', async () => {
    mockFetchCryptoData.mockImplementation(() => new Promise(() => {}));

    render(<App />);
    expect(screen.getByText('Chargement des données...')).toBeInTheDocument();
  });

  it('should show error state and retry on failure', async () => {
    mockFetchCryptoData.mockRejectedValue(new Error('Erreur API'));

    render(<App />);
    await waitFor(() => {
      expect(screen.getByText(/Erreur API/)).toBeInTheDocument();
    }, { timeout: 3000 });
    expect(screen.getByText('Réessayer')).toBeInTheDocument();
  });

  it('should contain a link to CoinGecko', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('Bitcoin')).toBeInTheDocument();
    }, { timeout: 3000 });
    const links = document.querySelectorAll('a[href*="coingecko.com"]');
    expect(links.length).toBeGreaterThan(0);
  });
});
