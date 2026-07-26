import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CryptoCard from '../components/CryptoCard.jsx';

vi.mock('../core/imageCache.js', () => ({
  getImageUrl: vi.fn((id, image) => image || `/images/cryptos/${id}.png`),
}));

function withRouter(element) {
  return <MemoryRouter>{element}</MemoryRouter>;
}

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
    render(withRouter(<CryptoCard coin={mockCoin} />));
    expect(screen.getByText('Bitcoin')).toBeInTheDocument();
    expect(screen.getByText('btc')).toBeInTheDocument();
  });

  it('should render crypto price', () => {
    render(withRouter(<CryptoCard coin={mockCoin} />));
    expect(screen.getByText('$50,000.00')).toBeInTheDocument();
  });

  it('should render market cap rank badge', () => {
    render(withRouter(<CryptoCard coin={mockCoin} />));
    expect(screen.getByText('#1')).toBeInTheDocument();
  });

  it('should render price change with positive sign', () => {
    render(withRouter(<CryptoCard coin={mockCoin} />));
    expect(screen.getByText('+5.50%')).toBeInTheDocument();
  });

  it('should render negative change correctly', () => {
    const negativeCoin = { ...mockCoin, price_change_percentage_24h: -3.2 };
    render(withRouter(<CryptoCard coin={negativeCoin} />));
    expect(screen.getByText('-3.20%')).toBeInTheDocument();
  });

  it('should render market cap', () => {
    render(withRouter(<CryptoCard coin={mockCoin} />));
    expect(screen.getByText('$1.00T')).toBeInTheDocument();
  });

  it('should render volume', () => {
    render(withRouter(<CryptoCard coin={mockCoin} />));
    expect(screen.getByText('$50.00B')).toBeInTheDocument();
  });

  it('should show chart on mouse enter after delay', async () => {
    render(withRouter(<CryptoCard coin={mockCoin} />));
    const card = screen.getByText('Bitcoin').closest('.crypto-card');

    fireEvent.mouseEnter(card);

    await waitFor(
      () => {
        expect(screen.queryByText('Graphique indisponible')).toBeNull();
      },
      { timeout: 350 },
    );
  });

  it('should handle null price_change_percentage_24h', () => {
    const coinWithoutChange = { ...mockCoin, price_change_percentage_24h: null };
    render(withRouter(<CryptoCard coin={coinWithoutChange} />));
    expect(screen.getByText('+0.00%')).toBeInTheDocument();
  });

  it('should handle missing sparkline data', async () => {
    const coinWithoutSparkline = { ...mockCoin, sparkline_in_7d: null };
    render(withRouter(<CryptoCard coin={coinWithoutSparkline} />));
    const card = screen.getByText('Bitcoin').closest('.crypto-card');
    fireEvent.mouseEnter(card);

    await waitFor(
      () => {
        expect(screen.getByText('Graphique indisponible')).toBeInTheDocument();
      },
      { timeout: 350 },
    );
  });

  it('should render no rank-evolution badge when rankHistory is empty', () => {
    render(withRouter(<CryptoCard coin={mockCoin} rankHistory={{}} />));
    const rank = screen.getByText('#1');
    expect(rank.querySelector('.rank-evolution')).toBeNull();
  });

  it('should render ▲ badge when rank improved', () => {
    const coin = { ...mockCoin, display_rank: 5 };
    const rankHistory = { bitcoin: 10 };
    render(withRouter(<CryptoCard coin={coin} rankHistory={rankHistory} />));
    const badge = screen.getByText('▲5');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('rank-up');
  });

  it('should render ▼ badge when rank dropped', () => {
    const coin = { ...mockCoin, display_rank: 10 };
    const rankHistory = { bitcoin: 5 };
    render(withRouter(<CryptoCard coin={coin} rankHistory={rankHistory} />));
    const badge = screen.getByText('▼5');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('rank-down');
  });

  it('should render — badge when rank unchanged', () => {
    const coin = { ...mockCoin, display_rank: 5 };
    const rankHistory = { bitcoin: 5 };
    render(withRouter(<CryptoCard coin={coin} rankHistory={rankHistory} />));
    const badge = screen.getByText('—');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('rank-stable');
  });

  it('should apply rank-up class when rank improved', () => {
    const coin = { ...mockCoin, display_rank: 3 };
    const rankHistory = { bitcoin: 7 };
    render(withRouter(<CryptoCard coin={coin} rankHistory={rankHistory} />));
    const badge = screen.getByText('▲4');
    expect(badge).toHaveClass('rank-up');
    expect(badge).not.toHaveClass('rank-down');
  });

  it('should apply rank-down class when rank dropped', () => {
    const coin = { ...mockCoin, display_rank: 8 };
    const rankHistory = { bitcoin: 2 };
    render(withRouter(<CryptoCard coin={coin} rankHistory={rankHistory} />));
    const badge = screen.getByText('▼6');
    expect(badge).toHaveClass('rank-down');
    expect(badge).not.toHaveClass('rank-up');
  });

  it('should apply rank-stable class when rank unchanged', () => {
    const coin = { ...mockCoin, display_rank: 1 };
    const rankHistory = { bitcoin: 1 };
    render(withRouter(<CryptoCard coin={coin} rankHistory={rankHistory} />));
    const badge = screen.getByText('—');
    expect(badge).toHaveClass('rank-stable');
    expect(badge).not.toHaveClass('rank-up');
    expect(badge).not.toHaveClass('rank-down');
  });
});
