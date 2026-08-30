import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import App from '../App.jsx';

const mockCryptos = [
  {
    id: 'bitcoin',
    symbol: 'btc',
    name: 'Bitcoin',
    current_price: 65000,
    market_cap: 1270000000000,
    market_cap_rank: 1,
    total_volume: 45000000000,
    price_change_percentage_24h: 2.5,
    ath: 69000,
    image: 'https://example.com/btc.png',
    sparkline_in_7d: { price: [63000, 64000, 64500] },
  },
  {
    id: 'ethereum',
    symbol: 'eth',
    name: 'Ethereum',
    current_price: 3500,
    market_cap: 420000000000,
    market_cap_rank: 2,
    total_volume: 20000000000,
    price_change_percentage_24h: -1.2,
    ath: 4800,
    image: 'https://example.com/eth.png',
    sparkline_in_7d: { price: [3450, 3480, 3500] },
  },
  {
    id: 'tether',
    symbol: 'usdt',
    name: 'Tether',
    current_price: 1,
    market_cap: 95000000000,
    market_cap_rank: 3,
    total_volume: 50000000000,
    price_change_percentage_24h: 0.01,
    ath: 1,
    image: 'https://example.com/usdt.png',
    sparkline_in_7d: { price: [1, 1, 1] },
  },
  {
    id: 'solana',
    symbol: 'sol',
    name: 'Solana',
    current_price: 145,
    market_cap: 65000000000,
    market_cap_rank: 5,
    total_volume: 3000000000,
    price_change_percentage_24h: 5.0,
    ath: 260,
    image: 'https://example.com/sol.png',
    sparkline_in_7d: { price: [140, 142, 145] },
  },
];

const mockStocks = [
  {
    id: 'apple-xstock',
    symbol: 'aapl',
    name: 'Apple',
    current_price: 178,
    price_change_percentage_24h: 1.5,
    market_cap: 2800000000000,
    image: 'https://example.com/aapl.png',
    sparkline_in_7d: { price: [] },
  },
  {
    id: 'nvidia-xstock',
    symbol: 'nvda',
    name: 'NVIDIA',
    current_price: 880,
    price_change_percentage_24h: -0.8,
    market_cap: 2200000000000,
    image: 'https://example.com/nvda.png',
    sparkline_in_7d: { price: [] },
  },
];

const mockFearGreed = { data: [{ value: '55', value_classification: 'Neutral' }] };

const {
  mockFetchCryptoData,
  mockFetchXStocks,
  mockFetchFearAndGreed,
  mockFetchCategories,
  mockFetchStablecoins,
  mockFetchCryptoDataByCategory,
} = vi.hoisted(() => ({
  mockFetchCryptoData: vi.fn(),
  mockFetchXStocks: vi.fn(),
  mockFetchFearAndGreed: vi.fn(),
  mockFetchCategories: vi.fn(),
  mockFetchStablecoins: vi.fn(),
  mockFetchCryptoDataByCategory: vi.fn(),
}));

vi.mock('../core/api.js', async (importOriginal) => {
  const original = await importOriginal();
  return {
    ...original,
    fetchCryptoData: mockFetchCryptoData,
    fetchXStocks: mockFetchXStocks,
    fetchFearAndGreed: mockFetchFearAndGreed,
    fetchCategories: mockFetchCategories,
    fetchStablecoins: mockFetchStablecoins,
    fetchCryptoDataByCategory: mockFetchCryptoDataByCategory,
  };
});

vi.mock('../core/weatherApi.js', () => ({
  detectLocation: vi.fn().mockResolvedValue({ lat: 48.85, lon: 2.35 }),
  fetchWeather: vi.fn().mockResolvedValue({
    temp: 22,
    condition: 'Sunny',
    icon: '//cdn.weatherapi.com/weather/64x64/day/113.png',
    city: 'Paris',
    country: 'France',
  }),
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
  mockFetchCategories.mockResolvedValue([
    { id: 'smart-contract-platform', name: 'Smart Contract Platform' },
    { id: 'ethereum-ecosystem', name: 'Ethereum Ecosystem' },
    { id: 'layer-1', name: 'Layer 1' },
  ]);
  mockFetchStablecoins.mockResolvedValue([
    {
      id: 'tether',
      symbol: 'usdt',
      name: 'Tether',
      current_price: 1,
      market_cap: 95000000000,
      total_volume: 50000000000,
      price_change_percentage_24h: 0.01,
      ath: 1,
      image: 'https://example.com/usdt.png',
      sparkline_in_7d: { price: [1, 1, 1] },
    },
    {
      id: 'usd-coin',
      symbol: 'usdc',
      name: 'USDC',
      current_price: 1,
      market_cap: 40000000000,
      total_volume: 2000000000,
      price_change_percentage_24h: 0.0,
      ath: 1,
      image: 'https://example.com/usdc.png',
      sparkline_in_7d: { price: [1, 1, 1] },
    },
  ]);
  mockFetchCryptoDataByCategory.mockResolvedValue([]);
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
    await waitFor(
      () => {
        expect(screen.getAllByText('SOL').length).toBeGreaterThan(0);
      },
      { timeout: 3000 },
    );
  });

  it('should render the stocks ticker after loading', async () => {
    render(<App />);
    await waitFor(
      () => {
        expect(screen.getAllByText('AAPL').length).toBeGreaterThan(0);
      },
      { timeout: 3000 },
    );
  });

  it('should render crypto cards with names after loading', async () => {
    render(<App />);
    await waitFor(
      () => {
        expect(screen.getByText('Bitcoin')).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
    expect(screen.getByText('Ethereum')).toBeInTheDocument();
    expect(screen.getByText('Solana')).toBeInTheDocument();
  });

  it('should filter out stablecoins (USDT should not appear)', async () => {
    render(<App />);
    await waitFor(
      () => {
        expect(screen.getByText('Bitcoin')).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
    expect(screen.queryByText('Tether')).not.toBeInTheDocument();
  });

  it('should display display_rank instead of market_cap_rank', async () => {
    render(<App />);
    await waitFor(
      () => {
        expect(screen.getByText('Bitcoin')).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
    expect(screen.getByText('#1')).toBeInTheDocument();
  });

  it('should render market indicators section', async () => {
    render(<App />);
    await waitFor(
      () => {
        expect(screen.getByText('BTC Dom.')).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
    expect(screen.getByText(/^Market Cap/)).toBeInTheDocument();
    expect(screen.getByText('Fear & Greed')).toBeInTheDocument();
  });

  it('should render price formatted correctly', async () => {
    render(<App />);
    await waitFor(
      () => {
        expect(screen.getByText('$65,000.00')).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });

  it('should render market cap formatted correctly', async () => {
    render(<App />);
    await waitFor(
      () => {
        expect(screen.getByText('$1.27T')).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });

  it('should show loading state initially', async () => {
    mockFetchCryptoData.mockImplementation(() => new Promise(() => {}));

    render(<App />);
    expect(screen.getByText('Chargement des données...')).toBeInTheDocument();
  });

  it('should show error state and retry on failure', async () => {
    mockFetchCryptoData.mockRejectedValue(new Error('Erreur API'));

    render(<App />);
    await waitFor(
      () => {
        expect(screen.getByText(/Erreur API/)).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
    expect(screen.getByText('Réessayer')).toBeInTheDocument();
  });

  it('should contain a link to CoinGecko', async () => {
    render(<App />);
    await waitFor(
      () => {
        expect(screen.getByText('Bitcoin')).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
    const links = document.querySelectorAll('a[href*="coingecko.com"]');
    expect(links.length).toBeGreaterThan(0);
  });

  it('should show the category dropdown in the market indicators', async () => {
    render(<App />);
    await waitFor(
      () => {
        expect(screen.getByLabelText('Filtrer par catégorie')).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });

  it('should show the collapsed stablecoin section by default', async () => {
    render(<App />);
    await waitFor(
      () => {
        expect(screen.getByText(/Stablecoins/)).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
    expect(screen.queryByText('Tether')).toBeNull();
  });

  it('should reveal stablecoins when the section is expanded', async () => {
    render(<App />);
    await waitFor(
      () => {
        expect(screen.getByText(/Stablecoins/)).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
    fireEvent.click(screen.getByText(/Stablecoins/));
    await waitFor(
      () => {
        expect(screen.getByText('Tether')).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });

  it('should exclude stablecoins below the market cap threshold', async () => {
    mockFetchStablecoins.mockResolvedValue([
      {
        id: 'tether',
        symbol: 'usdt',
        name: 'Tether',
        current_price: 1,
        market_cap: 95_000_000_000,
        total_volume: 50_000_000_000,
        price_change_percentage_24h: 0.01,
        ath: 1,
        sparkline_in_7d: { price: [1, 1, 1] },
      },
      {
        id: 'small-pegged',
        symbol: 'smal',
        name: 'Small Pegged',
        current_price: 1,
        market_cap: 50_000_000,
        total_volume: 1_000_000,
        price_change_percentage_24h: 0.0,
        ath: 1,
        sparkline_in_7d: { price: [1, 1, 1] },
      },
    ]);

    render(<App />);
    await waitFor(
      () => {
        expect(screen.getByText(/Stablecoins/)).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
    const countEl = document.querySelector('.stablecoin-count');
    await waitFor(
      () => {
        expect(countEl?.textContent).toBe('1');
      },
      { timeout: 3000 },
    );

    fireEvent.click(screen.getByText(/Stablecoins/));
    await waitFor(
      () => {
        expect(screen.getByText('Tether')).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
    expect(screen.queryByText('Small Pegged')).not.toBeInTheDocument();
  });
});

describe('App - Rank snapshot logic', () => {
  it('should save rankHistory to localStorage when no previous snapshot exists', async () => {
    render(<App />);
    await waitFor(
      () => {
        expect(screen.getByText('Bitcoin')).toBeInTheDocument();
      },
      { timeout: 3000 },
    );

    const stored = JSON.parse(localStorage.getItem('rankHistory'));
    expect(stored).toBeDefined();
    expect(stored.bitcoin).toBeDefined();
    expect(typeof stored.bitcoin).toBe('number');

    const snapshotDate = localStorage.getItem('rankSnapshotDate');
    expect(snapshotDate).toBeTruthy();
  });

  it('should NOT overwrite existing snapshot within 10 days', async () => {
    const today = new Date().toDateString();
    const existingRanks = { bitcoin: 99, ethereum: 98 };
    localStorage.setItem('rankHistory', JSON.stringify(existingRanks));
    localStorage.setItem('rankSnapshotDate', today);

    render(<App />);
    await waitFor(
      () => {
        expect(screen.getByText('Bitcoin')).toBeInTheDocument();
      },
      { timeout: 3000 },
    );

    const stored = JSON.parse(localStorage.getItem('rankHistory'));
    expect(stored).toEqual(existingRanks);
  });

  it('should clear rankHistory when snapshot is older than 10 days', async () => {
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 11);
    const existingRanks = { bitcoin: 1, ethereum: 2 };
    localStorage.setItem('rankHistory', JSON.stringify(existingRanks));
    localStorage.setItem('rankSnapshotDate', oldDate.toDateString());

    render(<App />);
    await waitFor(
      () => {
        expect(screen.getByText('Bitcoin')).toBeInTheDocument();
      },
      { timeout: 3000 },
    );

    const stored = JSON.parse(localStorage.getItem('rankHistory'));
    expect(stored).toEqual({});

    const snapshotDate = localStorage.getItem('rankSnapshotDate');
    expect(snapshotDate).toBe('');
  });

  it('should save new snapshot after clearing stale one on next load', async () => {
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 11);
    const existingRanks = { bitcoin: 1, ethereum: 2 };
    localStorage.setItem('rankHistory', JSON.stringify(existingRanks));
    localStorage.setItem('rankSnapshotDate', oldDate.toDateString());

    const { unmount } = render(<App />);
    await waitFor(
      () => {
        expect(screen.getByText('Bitcoin')).toBeInTheDocument();
      },
      { timeout: 3000 },
    );

    unmount();

    const { unmount: unmount2 } = render(<App />);
    await waitFor(
      () => {
        expect(screen.getByText('Bitcoin')).toBeInTheDocument();
      },
      { timeout: 3000 },
    );

    await waitFor(
      () => {
        const stored = JSON.parse(localStorage.getItem('rankHistory'));
        expect(stored.bitcoin).toBeDefined();
        expect(stored).not.toEqual(existingRanks);
      },
      { timeout: 3000 },
    );

    const snapshotDate = localStorage.getItem('rankSnapshotDate');
    expect(snapshotDate).toBe(new Date().toDateString());

    unmount2();
  });
});

describe('App - Keyboard shortcuts', () => {
  it('should refresh data when pressing R', async () => {
    render(<App />);
    await waitFor(
      () => {
        expect(screen.getByText('Bitcoin')).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
    const callsBefore = mockFetchCryptoData.mock.calls.length;
    fireEvent.keyDown(window, { key: 'r' });
    await waitFor(
      () => {
        expect(mockFetchCryptoData.mock.calls.length).toBe(callsBefore + 1);
      },
      { timeout: 3000 },
    );
  });

  it('should toggle the theme when pressing T', async () => {
    render(<App />);
    await waitFor(
      () => {
        expect(screen.getByText('Bitcoin')).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    fireEvent.keyDown(window, { key: 't' });
    await waitFor(
      () => {
        expect(document.documentElement.getAttribute('data-theme')).toBe('light');
      },
      { timeout: 3000 },
    );
    expect(localStorage.getItem('theme')).toBe('light');
  });

  it('should focus the search input when pressing F', async () => {
    render(<App />);
    await waitFor(
      () => {
        expect(screen.getByText('Bitcoin')).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
    fireEvent.keyDown(window, { key: 'f' });
    expect(document.activeElement).toHaveClass('search-input');
  });

  it('should not trigger shortcuts when typing in an input', async () => {
    render(<App />);
    await waitFor(
      () => {
        expect(screen.getByText('Bitcoin')).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
    const callsBefore = mockFetchCryptoData.mock.calls.length;
    fireEvent.keyDown(screen.getByPlaceholderText(/Rechercher une crypto/), { key: 'r' });
    expect(mockFetchCryptoData.mock.calls.length).toBe(callsBefore);
  });
});

describe('App - Favorites filter and notifications', () => {
  it('should filter the grid to favorites when the favorites filter is toggled', async () => {
    localStorage.setItem('favorites', JSON.stringify(['bitcoin']));
    render(<App />);
    await waitFor(
      () => {
        expect(screen.getByText('Bitcoin')).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
    expect(screen.getByText('Ethereum')).toBeInTheDocument();

    const filterBtn = document.querySelector('.favorites-filter-btn');
    expect(filterBtn).not.toHaveClass('active');
    fireEvent.click(filterBtn);

    await waitFor(
      () => {
        expect(screen.queryByText('Ethereum')).not.toBeInTheDocument();
      },
      { timeout: 3000 },
    );
    expect(screen.getByText('Bitcoin')).toBeInTheDocument();
    expect(filterBtn).toHaveClass('active');
  });

  it('should display the favorites count badge', async () => {
    localStorage.setItem('favorites', JSON.stringify(['bitcoin', 'ethereum']));
    render(<App />);
    await waitFor(
      () => {
        expect(screen.getByText('Bitcoin')).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
    expect(document.querySelector('.favorites-count').textContent).toBe('2');
  });

  it('should enable notifications when permission is granted', async () => {
    Notification.requestPermission.mockResolvedValue('granted');
    render(<App />);
    await waitFor(
      () => {
        expect(screen.getByText('Bitcoin')).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
    fireEvent.click(screen.getByTitle('Activer les notifications'));
    await waitFor(
      () => {
        expect(screen.getByTitle('Désactiver les notifications')).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
    expect(localStorage.getItem('notificationsEnabled')).toBe('true');
  });

  it('should show a toast when permission is denied', async () => {
    Notification.requestPermission.mockResolvedValue('denied');
    render(<App />);
    await waitFor(
      () => {
        expect(screen.getByText('Bitcoin')).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
    fireEvent.click(screen.getByTitle('Activer les notifications'));
    await waitFor(
      () => {
        expect(screen.getByText(/Notifications refusées par le navigateur/)).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });

  it('should dismiss the notification toast when clicking the close button', async () => {
    Notification.requestPermission.mockResolvedValue('denied');
    render(<App />);
    await waitFor(
      () => {
        expect(screen.getByText('Bitcoin')).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
    fireEvent.click(screen.getByTitle('Activer les notifications'));
    await waitFor(
      () => {
        expect(screen.getByText(/Notifications refusées par le navigateur/)).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
    fireEvent.click(screen.getByRole('button', { name: '×' }));
    await waitFor(
      () => {
        expect(screen.queryByText(/Notifications refusées par le navigateur/)).not.toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });

  it('should disable notifications when already enabled and button is clicked', async () => {
    Notification.permission = 'granted';
    localStorage.setItem('notificationsEnabled', 'true');
    render(<App />);
    await waitFor(
      () => {
        expect(screen.getByTitle('Désactiver les notifications')).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
    fireEvent.click(screen.getByTitle('Désactiver les notifications'));
    await waitFor(
      () => {
        expect(localStorage.getItem('notificationsEnabled')).toBe('false');
      },
      { timeout: 3000 },
    );
    expect(screen.getByTitle('Activer les notifications')).toBeInTheDocument();
  });
});

describe('App - Category filter', () => {
  it('should load and display category coins when a category is selected', async () => {
    mockFetchCryptoDataByCategory.mockResolvedValue([
      {
        id: 'x-cat-coin',
        symbol: 'xcat',
        name: 'X Cat Coin',
        current_price: 10,
        market_cap: 1000,
        total_volume: 100,
        price_change_percentage_24h: 1,
        image: 'https://example.com/xcat.png',
        sparkline_in_7d: { price: [] },
      },
    ]);
    render(<App />);
    await waitFor(
      () => {
        expect(screen.getByText('Bitcoin')).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
    fireEvent.change(screen.getByLabelText('Filtrer par catégorie'), {
      target: { value: 'smart-contract-platform' },
    });
    await waitFor(
      () => {
        expect(screen.getByText('X Cat Coin')).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
    expect(mockFetchCryptoDataByCategory).toHaveBeenCalledWith('smart-contract-platform');
    expect(screen.queryByText('Bitcoin')).not.toBeInTheDocument();
  });

  it('should show a category error when the fetch fails and no fallback matches', async () => {
    mockFetchCryptoDataByCategory.mockRejectedValue(new Error('boom'));
    render(<App />);
    await waitFor(
      () => {
        expect(screen.getByText('Bitcoin')).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
    fireEvent.change(screen.getByLabelText('Filtrer par catégorie'), {
      target: { value: 'smart-contract-platform' },
    });
    await waitFor(
      () => {
        expect(screen.getByText(/Impossible de charger la catégorie/)).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });

  it('should fall back to the main grid when the category is cleared', async () => {
    mockFetchCryptoDataByCategory.mockResolvedValue([
      {
        id: 'x-cat-coin',
        symbol: 'xcat',
        name: 'X Cat Coin',
        current_price: 10,
        market_cap: 1000,
        total_volume: 100,
        price_change_percentage_24h: 1,
        image: 'https://example.com/xcat.png',
        sparkline_in_7d: { price: [] },
      },
    ]);
    render(<App />);
    await waitFor(
      () => {
        expect(screen.getByText('Bitcoin')).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
    fireEvent.change(screen.getByLabelText('Filtrer par catégorie'), {
      target: { value: 'smart-contract-platform' },
    });
    await waitFor(
      () => {
        expect(screen.getByText('X Cat Coin')).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
    fireEvent.change(screen.getByLabelText('Filtrer par catégorie'), {
      target: { value: '' },
    });
    await waitFor(
      () => {
        expect(screen.getByText('Bitcoin')).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
    expect(screen.queryByText('X Cat Coin')).not.toBeInTheDocument();
  });
});

describe('App - Error retry', () => {
  it('should reload data when clicking the retry button after an error', async () => {
    mockFetchCryptoData.mockRejectedValueOnce(new Error('Erreur API'));
    render(<App />);
    await waitFor(
      () => {
        expect(screen.getByText(/Erreur API/)).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
    const callsBefore = mockFetchCryptoData.mock.calls.length;
    fireEvent.click(screen.getByText('Réessayer'));
    await waitFor(
      () => {
        expect(mockFetchCryptoData.mock.calls.length).toBe(callsBefore + 1);
      },
      { timeout: 3000 },
    );
    expect(screen.getByText('Bitcoin')).toBeInTheDocument();
  });
});

describe('App - Search and notification edge cases', () => {
  it('should filter cards via the search input', async () => {
    render(<App />);
    await waitFor(
      () => {
        expect(screen.getByText('Bitcoin')).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
    fireEvent.change(screen.getByPlaceholderText(/Rechercher une crypto/), {
      target: { value: 'eth' },
    });
    await waitFor(
      () => {
        expect(screen.getByText('Ethereum')).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
    expect(screen.queryByText('Bitcoin')).not.toBeInTheDocument();
    expect(screen.queryByText('Solana')).not.toBeInTheDocument();
  });

  it('should reset the notifications flag when permission is not granted on init', async () => {
    localStorage.setItem('notificationsEnabled', 'true');
    render(<App />);
    await waitFor(
      () => {
        expect(screen.getByText('Bitcoin')).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
    expect(screen.getByTitle('Activer les notifications')).toBeInTheDocument();
    expect(localStorage.getItem('notificationsEnabled')).toBe('false');
  });

  it('should show a toast when notification permission stays pending', async () => {
    Notification.requestPermission.mockResolvedValue('default');
    render(<App />);
    await waitFor(
      () => {
        expect(screen.getByText('Bitcoin')).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
    fireEvent.click(screen.getByTitle('Activer les notifications'));
    await waitFor(
      () => {
        expect(screen.getByText(/Permission de notification non accordée/)).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });

  it('should fall back to matching main coins when the category fetch fails', async () => {
    mockFetchCryptoDataByCategory.mockRejectedValue(new Error('boom'));
    render(<App />);
    await waitFor(
      () => {
        expect(screen.getByText('Bitcoin')).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
    fireEvent.change(screen.getByLabelText('Filtrer par catégorie'), {
      target: { value: 'layer-1' },
    });
    await waitFor(
      () => {
        expect(screen.getByText('Ethereum')).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
    expect(screen.getByText('Bitcoin')).toBeInTheDocument();
    expect(screen.getByText('Solana')).toBeInTheDocument();
    expect(screen.queryByText(/Impossible de charger la catégorie/)).not.toBeInTheDocument();
  });
});
