import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CryptoCard from '../components/CryptoCard.jsx';

vi.mock('../core/imageCache.js', () => ({
  getImageUrl: vi.fn((id, image) => image || `/images/cryptos/${id}.png`),
}));

describe('CryptoCard', () => {
  const mockCoin = {
    id: 'bitcoin',
    name: 'Bitcoin',
    symbol: 'btc',
    current_price: 50000,
    price_change_percentage_24h: 5.5,
    market_cap: 1000000000000,
    market_cap_rank: 1,
    display_rank: 1,
    total_volume: 50000000000,
    image: 'https://example.com/btc.png',
    sparkline_in_7d: {
      price: [45000, 46000, 47000, 48000, 49000, 50000],
    },
  };

  it('should render crypto name and symbol', () => {
    render(<CryptoCard coin={mockCoin} />);
    expect(screen.getByText('Bitcoin')).toBeInTheDocument();
    expect(screen.getByText('btc')).toBeInTheDocument();
  });

  it('should render crypto price', () => {
    render(<CryptoCard coin={mockCoin} />);
    expect(screen.getByText('$50,000.00')).toBeInTheDocument();
  });

  it('should render market cap rank badge', () => {
    render(<CryptoCard coin={mockCoin} />);
    expect(screen.getByText('#1')).toBeInTheDocument();
  });

  it('should render price change with positive sign', () => {
    render(<CryptoCard coin={mockCoin} />);
    expect(screen.getByText('+5.50% (24h)')).toBeInTheDocument();
  });

  it('should render negative change correctly', () => {
    const negativeCoin = { ...mockCoin, price_change_percentage_24h: -3.2 };
    render(<CryptoCard coin={negativeCoin} />);
    expect(screen.getByText('-3.20% (24h)')).toBeInTheDocument();
  });

  it('should render market cap', () => {
    render(<CryptoCard coin={mockCoin} />);
    expect(screen.getByText('$1.00T')).toBeInTheDocument();
  });

  it('should render volume', () => {
    render(<CryptoCard coin={mockCoin} />);
    expect(screen.getByText('$50.00B')).toBeInTheDocument();
  });

  it('should show chart on mouse enter after delay', async () => {
    render(<CryptoCard coin={mockCoin} />);
    const card = screen.getByText('Bitcoin').closest('.crypto-card');
    
    fireEvent.mouseEnter(card);
    
    await waitFor(() => {
      expect(screen.queryByText('Graphique indisponible')).toBeNull();
    }, { timeout: 350 });
  });

  it('should handle null price_change_percentage_24h', () => {
    const coinWithoutChange = { ...mockCoin, price_change_percentage_24h: null };
    render(<CryptoCard coin={coinWithoutChange} />);
    expect(screen.getByText('+0.00% (24h)')).toBeInTheDocument();
  });

  it('should handle missing sparkline data', async () => {
    const coinWithoutSparkline = { ...mockCoin, sparkline_in_7d: null };
    render(<CryptoCard coin={coinWithoutSparkline} />);
    const card = screen.getByText('Bitcoin').closest('.crypto-card');
    fireEvent.mouseEnter(card);
    
    await waitFor(() => {
      expect(screen.getByText('Graphique indisponible')).toBeInTheDocument();
    }, { timeout: 350 });
  });
});