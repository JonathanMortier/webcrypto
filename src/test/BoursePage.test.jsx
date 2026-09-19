import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import BoursePage from '../pages/BoursePage.jsx';

const mockIndices = [
  {
    id: 'sp500',
    name: 'S&P 500',
    symbol: '^GSPC',
    currency: '$',
    price: 5500,
    change: 25,
    changePercent: 0.46,
  },
  {
    id: 'nasdaq',
    name: 'Nasdaq',
    symbol: '^IXIC',
    currency: '$',
    price: 18000,
    change: -50,
    changePercent: -0.28,
  },
  {
    id: 'cac40',
    name: 'CAC 40',
    symbol: '^FCHI',
    currency: '€',
    price: 8401.18,
    change: 81.31,
    changePercent: 0.98,
  },
  {
    id: 'nikkei',
    name: 'Nikkei 225',
    symbol: '^N225',
    currency: '¥',
    price: 66405.56,
    change: 273.58,
    changePercent: 0.41,
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
    id: 'microsoft-xstock',
    symbol: 'msft',
    name: 'Microsoft',
    current_price: 420,
    price_change_percentage_24h: -0.3,
    market_cap: 3100000000000,
    image: 'https://example.com/msft.png',
    sparkline_in_7d: { price: [] },
  },
];

const mockEtfs = [
  {
    id: 'sp500-etf',
    name: 'ETF S&P 500',
    symbol: 'PSPH.PA',
    isin: 'FR0011871136',
    currency: '€',
    price: 550,
    change: 2.5,
    changePercent: 0.46,
  },
  {
    id: 'msci-world-etf',
    name: 'ETF MSCI World',
    symbol: 'EUNL.DE',
    isin: 'IE00B4L5Y983',
    currency: '€',
    price: 350,
    change: 2.1,
    changePercent: 0.6,
  },
];

const { mockFetchIndicesData, mockFetchIndicesEtfData, mockFetchIndexHistory, mockFetchXStocks, mockFetchGoldPrice } =
  vi.hoisted(() => ({
    mockFetchIndicesData: vi.fn(),
    mockFetchIndicesEtfData: vi.fn(),
    mockFetchIndexHistory: vi.fn(),
    mockFetchXStocks: vi.fn(),
    mockFetchGoldPrice: vi.fn(),
  }));

vi.mock('../core/api.js', async (importOriginal) => {
  const original = await importOriginal();
  return {
    ...original,
    fetchIndicesData: mockFetchIndicesData,
    fetchIndicesEtfData: mockFetchIndicesEtfData,
    fetchIndexHistory: mockFetchIndexHistory,
    fetchXStocks: mockFetchXStocks,
    fetchGoldPrice: mockFetchGoldPrice,
  };
});

vi.mock('../components/IndexChart.jsx', () => ({
  default: ({ symbol }) => <div data-testid="index-chart">{symbol}</div>,
}));

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
  mockFetchIndicesEtfData.mockResolvedValue(mockEtfs);
  mockFetchIndexHistory.mockResolvedValue([
    [1700000000000, 5000],
    [1700001000000, 5500],
  ]);
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
    await waitFor(
      () => {
        expect(screen.getByText('S&P 500')).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
    expect(screen.getByText('Nasdaq')).toBeInTheDocument();
    expect(screen.getByText('CAC 40')).toBeInTheDocument();
    expect(screen.getByText('Nikkei 225')).toBeInTheDocument();
  });

  it('should render index prices with the correct currency', async () => {
    render(<BoursePage />);
    await waitFor(
      () => {
        expect(screen.getAllByText(/5500\.00 \$$/).length).toBeGreaterThan(0);
      },
      { timeout: 3000 },
    );
    expect(screen.getByText('18000.00 $')).toBeInTheDocument();
    expect(screen.getByText('8401.18 €')).toBeInTheDocument();
    expect(screen.getByText('66405.56 ¥')).toBeInTheDocument();
  });

  it('should render index change with positive/negative signs', async () => {
    render(<BoursePage />);
    await waitFor(
      () => {
        expect(screen.getByText('+25.00 (0.46%)')).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
    expect(screen.getByText('-50.00 (-0.28%)')).toBeInTheDocument();
  });

  it('should render index ETFs with ISIN and euro prices', async () => {
    render(<BoursePage />);
    await waitFor(
      () => {
        expect(screen.getByText('ETF S&P 500')).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
    expect(screen.getByText('ETF MSCI World')).toBeInTheDocument();
    expect(screen.getByText('FR0011871136')).toBeInTheDocument();
    expect(screen.getByText('550.00 €')).toBeInTheDocument();
  });

  it('should render a chart for real indices instead of portfolio fields', async () => {
    render(<BoursePage />);
    await waitFor(
      () => {
        expect(screen.getByText('S&P 500')).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
    const charts = screen.getAllByTestId('index-chart');
    expect(charts.length).toBe(4);
    expect(charts[0]).toHaveTextContent('^GSPC');
    expect(screen.getAllByText('Units').length).toBe(2);
  });

  it('should render stock grid after loading', async () => {
    render(<BoursePage />);
    await waitFor(
      () => {
        const cards = screen.getAllByTestId('crypto-card');
        expect(cards.length).toBe(2);
      },
      { timeout: 3000 },
    );
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.getByText('Microsoft')).toBeInTheDocument();
  });

  it('should show error state when fetch fails', async () => {
    mockFetchXStocks.mockRejectedValue(new Error('Erreur de récupération'));

    render(<BoursePage />);
    await waitFor(
      () => {
        expect(screen.getByText(/Erreur de récupération/)).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });

  it('should render portfolio input fields for holdings', async () => {
    render(<BoursePage />);
    await waitFor(
      () => {
        expect(screen.getAllByPlaceholderText('0').length).toBeGreaterThan(0);
      },
      { timeout: 3000 },
    );
  });

  it('should render gold price card when fetch succeeds', async () => {
    mockFetchGoldPrice.mockResolvedValue({ price: 4360.5, change: 25.3, changePercent: 0.58 });

    render(<BoursePage />);
    await waitFor(
      () => {
        expect(screen.getByText('Gold (XAU)')).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
    expect(screen.getByText('$4360.50')).toBeInTheDocument();
    expect(screen.getByText('+25.30 (0.58%)')).toBeInTheDocument();
  });

  it('should hide gold card on fetch error', async () => {
    mockFetchGoldPrice.mockRejectedValue(new Error('API error'));

    render(<BoursePage />);
    await waitFor(
      () => {
        expect(screen.getByText('S&P 500')).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
    expect(screen.queryByText('Gold (XAU)')).not.toBeInTheDocument();
  });

  describe('SpaceX card', () => {
    beforeEach(() => {
      localStorage.removeItem('cryptowatch_cache_spacex_price');
    });

    it('should render the spacex-card div even when no cache exists', async () => {
      render(<BoursePage />);
      await waitFor(
        () => {
          expect(screen.getByText('S&P 500')).toBeInTheDocument();
        },
        { timeout: 3000 },
      );
      const cards = document.querySelectorAll('.spacex-card');
      expect(cards.length).toBe(1);
      expect(screen.getByText('SpaceX')).toBeInTheDocument();
      expect(screen.getByText('SPCX • Nasdaq')).toBeInTheDocument();
    });

    it('should show "--" while loading (no cache, fetch pending)', () => {
      mockFetchXStocks.mockImplementation(() => new Promise(() => {}));
      render(<BoursePage />);
      const spacexCards = document.querySelectorAll('.spacex-card');
      expect(spacexCards.length).toBe(1);
      expect(screen.getByText('--')).toBeInTheDocument();
    });

    it('should show cached price from localStorage on mount', async () => {
      const cached = {
        data: { price: 192.5, change: 31.55, changePercent: 19.6 },
        timestamp: Date.now(),
      };
      localStorage.setItem('cryptowatch_cache_spacex_price', JSON.stringify(cached));

      render(<BoursePage />);
      await waitFor(
        () => {
          expect(screen.getByText('S&P 500')).toBeInTheDocument();
        },
        { timeout: 3000 },
      );
      expect(document.querySelectorAll('.spacex-card').length).toBe(1);
      expect(screen.getByText('$192.50')).toBeInTheDocument();
    });

    it('should show change when cached data has change field', async () => {
      const cached = {
        data: { price: 192.5, change: 31.55, changePercent: 19.6 },
        timestamp: Date.now(),
      };
      localStorage.setItem('cryptowatch_cache_spacex_price', JSON.stringify(cached));

      render(<BoursePage />);
      await waitFor(
        () => {
          expect(screen.getByText('+31.55 (19.60%)')).toBeInTheDocument();
        },
        { timeout: 3000 },
      );
    });

    it('should show negative change class when cached change is negative', async () => {
      const cached = {
        data: { price: 150, change: -10, changePercent: -6.25 },
        timestamp: Date.now(),
      };
      localStorage.setItem('cryptowatch_cache_spacex_price', JSON.stringify(cached));

      render(<BoursePage />);
      await waitFor(
        () => {
          expect(screen.getByText('-10.00 (-6.25%)')).toBeInTheDocument();
        },
        { timeout: 3000 },
      );
    });

    it('should display the spacex logo image', async () => {
      render(<BoursePage />);
      await waitFor(
        () => {
          expect(screen.getByText('S&P 500')).toBeInTheDocument();
        },
        { timeout: 3000 },
      );
      const logo = document.querySelector('.spacex-icon img');
      expect(logo).toBeInTheDocument();
      expect(logo).toHaveAttribute('src', '/images/spacex-logo.svg');
    });
  });

  describe('Portfolio holdings', () => {
    beforeEach(() => {
      localStorage.removeItem('indices_holdings');
    });

    it('should compute gain/perte when units and avg price are entered', async () => {
      render(<BoursePage />);
      await waitFor(
        () => {
          expect(screen.getByText('ETF S&P 500')).toBeInTheDocument();
        },
        { timeout: 3000 },
      );

      const card = screen.getByText('ETF S&P 500').closest('.index-card');
      const inputs = within(card).getAllByRole('spinbutton');

      fireEvent.change(inputs[0], { target: { value: '1' } });
      fireEvent.change(inputs[1], { target: { value: '500' } });

      await waitFor(() => {
        expect(screen.getByText('+50,00 € (+10.00%)')).toBeInTheDocument();
      });
      expect(screen.getByText('Val. actuelle')).toBeInTheDocument();
      expect(card.querySelector('.gain-row').classList.contains('positive')).toBe(true);
    });

    it('should store holdings in localStorage', async () => {
      render(<BoursePage />);
      await waitFor(
        () => {
          expect(screen.getByText('ETF S&P 500')).toBeInTheDocument();
        },
        { timeout: 3000 },
      );

      const card = screen.getByText('ETF S&P 500').closest('.index-card');
      const inputs = within(card).getAllByRole('spinbutton');

      fireEvent.change(inputs[0], { target: { value: '3.5' } });
      fireEvent.change(inputs[1], { target: { value: '410' } });

      await waitFor(() => {
        expect(screen.getByText('+490,00 € (+34.15%)')).toBeInTheDocument();
      });
      const saved = JSON.parse(localStorage.getItem('indices_holdings'));
      expect(saved['sp500-etf']).toEqual({ units: 3.5, avgPrice: 410 });
    });

    it('should mark the gain row negative when the position is losing', async () => {
      render(<BoursePage />);
      await waitFor(
        () => {
          expect(screen.getByText('ETF S&P 500')).toBeInTheDocument();
        },
        { timeout: 3000 },
      );

      const card = screen.getByText('ETF S&P 500').closest('.index-card');
      const inputs = within(card).getAllByRole('spinbutton');

      fireEvent.change(inputs[0], { target: { value: '1' } });
      fireEvent.change(inputs[1], { target: { value: '600' } });

      await waitFor(() => {
        expect(screen.getByText('50,00 € (-8.33%)')).toBeInTheDocument();
      });
      expect(card.querySelector('.gain-row').classList.contains('negative')).toBe(true);
    });

    it('should restore holdings from localStorage on remount', async () => {
      const { unmount } = render(<BoursePage />);
      await waitFor(
        () => {
          expect(screen.getByText('ETF S&P 500')).toBeInTheDocument();
        },
        { timeout: 3000 },
      );

      const card = screen.getByText('ETF S&P 500').closest('.index-card');
      const inputs = within(card).getAllByRole('spinbutton');
      fireEvent.change(inputs[0], { target: { value: '1' } });
      fireEvent.change(inputs[1], { target: { value: '500' } });
      await waitFor(() => {
        expect(screen.getByText('+50,00 € (+10.00%)')).toBeInTheDocument();
      });

      unmount();

      render(<BoursePage />);
      await waitFor(
        () => {
          expect(screen.getByText('ETF S&P 500')).toBeInTheDocument();
        },
        { timeout: 3000 },
      );
      const restoredCard = screen.getByText('ETF S&P 500').closest('.index-card');
      const restoredInputs = within(restoredCard).getAllByRole('spinbutton');
      expect(restoredInputs[0]).toHaveValue(1);
      expect(restoredInputs[1]).toHaveValue(500);
      expect(screen.getByText('+50,00 € (+10.00%)')).toBeInTheDocument();
    });

    it('should hide the holding summary when units is cleared', async () => {
      render(<BoursePage />);
      await waitFor(
        () => {
          expect(screen.getByText('ETF S&P 500')).toBeInTheDocument();
        },
        { timeout: 3000 },
      );

      const card = screen.getByText('ETF S&P 500').closest('.index-card');
      const inputs = within(card).getAllByRole('spinbutton');
      fireEvent.change(inputs[0], { target: { value: '1' } });
      fireEvent.change(inputs[1], { target: { value: '500' } });
      await waitFor(() => {
        expect(screen.getByText('+50,00 € (+10.00%)')).toBeInTheDocument();
      });

      fireEvent.change(inputs[0], { target: { value: '' } });

      await waitFor(() => {
        expect(screen.queryByText('Gain/Pert')).not.toBeInTheDocument();
      });
      const saved = JSON.parse(localStorage.getItem('indices_holdings'));
      expect(saved['sp500-etf'].units).toBeNull();
      expect(saved['sp500-etf'].avgPrice).toBe(500);
    });
  });

  describe('Resilience', () => {
    it('should keep rendering when saved holdings JSON is corrupted', async () => {
      localStorage.setItem('indices_holdings', 'not-json');
      render(<BoursePage />);
      await waitFor(
        () => {
          expect(screen.getByText('S&P 500')).toBeInTheDocument();
        },
        { timeout: 3000 },
      );
      expect(screen.getAllByText('Units').length).toBe(2);
    });

    it('should warn but keep rendering when indices and ETF fetches fail', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      mockFetchIndicesData.mockRejectedValue(new Error('indices down'));
      mockFetchIndicesEtfData.mockRejectedValue(new Error('etf down'));
      render(<BoursePage />);
      await waitFor(
        () => {
          expect(screen.getByText('Apple')).toBeInTheDocument();
        },
        { timeout: 3000 },
      );
      expect(warnSpy).toHaveBeenCalledWith('Indices error:', expect.any(Error));
      expect(warnSpy).toHaveBeenCalledWith('Indices ETF error:', expect.any(Error));
      warnSpy.mockRestore();
    });
  });
});
