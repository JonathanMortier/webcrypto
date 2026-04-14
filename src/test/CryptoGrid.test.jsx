import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CryptoGrid from '../components/CryptoGrid.jsx';

vi.mock('../components/CryptoCard.jsx', () => ({
  default: ({ coin }) => (
    <div data-testid="crypto-card">{coin.name}</div>
  ),
}));

describe('CryptoGrid', () => {
  const mockCryptos = [
    { id: 'bitcoin', name: 'Bitcoin', symbol: 'btc', current_price: 50000 },
    { id: 'ethereum', name: 'Ethereum', symbol: 'eth', current_price: 3000 },
    { id: 'solana', name: 'Solana', symbol: 'sol', current_price: 150 },
  ];

  it('should render grid container', () => {
    render(<CryptoGrid cryptos={mockCryptos} />);
    const grid = document.querySelector('.crypto-grid');
    expect(grid).toBeInTheDocument();
  });

  it('should render all crypto cards', () => {
    render(<CryptoGrid cryptos={mockCryptos} />);
    const cards = screen.getAllByTestId('crypto-card');
    expect(cards.length).toBe(3);
  });

  it('should render correct crypto names', () => {
    render(<CryptoGrid cryptos={mockCryptos} />);
    expect(screen.getByText('Bitcoin')).toBeInTheDocument();
    expect(screen.getByText('Ethereum')).toBeInTheDocument();
    expect(screen.getByText('Solana')).toBeInTheDocument();
  });

  it('should handle empty array', () => {
    render(<CryptoGrid cryptos={[]} />);
    const cards = screen.queryAllByTestId('crypto-card');
    expect(cards.length).toBe(0);
  });
});