import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CoinDetailContent from '../components/CoinDetailContent.jsx';

vi.mock('../core/imageCache.js', () => ({ getImageUrl: (_id, url) => url }));
vi.mock('../components/PriceChart.jsx', () => ({ default: () => null }));

const baseCoin = {
  id: 'evilcoin',
  name: 'EvilCoin',
  symbol: 'evil',
  market_data: { current_price: { usd: 1 }, price_change_percentage_24h: 1 },
};

const renderCoin = (coin) =>
  render(
    <CoinDetailContent
      coin={{ ...baseCoin, ...coin }}
      timeframe="7"
      setTimeframe={() => {}}
      chartData={[]}
      chartLoading={false}
    />,
  );

describe('CoinDetailContent security', () => {
  it('does not render injected HTML from the description', () => {
    const payload = '<img src=x onerror="window.__xss = true"><b>Hello</b>';
    const { container } = renderCoin({ description: { en: payload } });
    expect(container.querySelector('.coin-detail-desc img')).toBeNull();
    expect(container.innerHTML).not.toContain('onerror');
    expect(container.querySelector('.coin-detail-desc b').textContent).toBe('Hello');
  });

  it('shows truncated plain text then sanitized HTML when expanded', () => {
    const long = `<p>${'a'.repeat(400)}<img src=x onerror="alert(1)"></p>`;
    const { container } = renderCoin({ description: { en: long } });
    expect(container.querySelector('.coin-detail-desc').textContent).toBe(`${'a'.repeat(300)}...`);
    fireEvent.click(screen.getByText('Lire la suite'));
    expect(container.querySelector('.coin-detail-desc p')).not.toBeNull();
    expect(container.innerHTML).not.toContain('onerror');
  });

  it('drops non-http(s) links', () => {
    const { container } = renderCoin({
      links: {
        homepage: ['javascript:alert(1)'],
        blockchain_site: ['javascript:alert(2)', 'https://etherscan.io/token/0x1'],
        subreddit_url: 'javascript:alert(3)',
      },
    });
    const hrefs = [...container.querySelectorAll('a')].map((a) => a.getAttribute('href'));
    expect(
      hrefs.some((h) => /^(javascript|data|vbscript):/.test((h ?? '').trim().toLowerCase())),
    ).toBe(false);
    expect(hrefs).toContain('https://etherscan.io/token/0x1');
  });
});
