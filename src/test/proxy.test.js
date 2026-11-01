import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import coingecko from '../../api/coingecko.js';
import yahoo from '../../api/yahoo.js';

function mockRes() {
  const res = {
    statusCode: 200,
    headers: {},
    body: undefined,
    setHeader: vi.fn((k, v) => {
      res.headers[k] = v;
    }),
    status: vi.fn((code) => {
      res.statusCode = code;
      return res;
    }),
    send: vi.fn((b) => {
      res.body = b;
      return res;
    }),
    json: vi.fn((b) => {
      res.body = b;
      return res;
    }),
  };
  return res;
}

let ipCounter = 0;
const req = (query, method = 'GET') => ({
  method,
  query,
  headers: { 'x-forwarded-for': `10.0.0.${++ipCounter % 250}` },
});

describe('API proxies', () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn(async () => ({
      status: 200,
      text: async () => '{"ok":true}',
    }));
  });
  afterEach(() => vi.restoreAllMocks());

  it('forwards allowed CoinGecko paths with query string', async () => {
    const res = mockRes();
    await coingecko(req({ path: 'api/v3/coins/markets', vs_currency: 'usd', per_page: '50' }), res);
    expect(fetch).toHaveBeenCalledWith(
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&per_page=50',
      expect.any(Object),
    );
    expect(res.statusCode).toBe(200);
    expect(res.headers['Content-Type']).toBe('application/json; charset=utf-8');
    expect(res.headers['Access-Control-Allow-Origin']).toBeUndefined();
  });

  it('forwards coin detail and market_chart paths', async () => {
    await coingecko(req({ path: 'api/v3/coins/bitcoin/market_chart', days: '7' }), mockRes());
    await coingecko(req({ path: 'api/v3/coins/usd-coin' }), mockRes());
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('forwards allowed Yahoo paths', async () => {
    await yahoo(req({ path: 'v8/finance/spark', symbols: '^GSPC' }), mockRes());
    await yahoo(req({ path: 'v8/finance/chart/%5EGSPC', range: '3mo' }), mockRes());
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it.each(['api/v3/simple/price', 'api/v3/coins/../../admin', 'api/v3/coins/bitcoin/tickers', '@evil.com/x', ''])(
    'rejects disallowed CoinGecko path %j',
    async (path) => {
      const res = mockRes();
      await coingecko(req({ path }), res);
      expect(res.statusCode).toBe(404);
      expect(fetch).not.toHaveBeenCalled();
    },
  );

  it('rejects disallowed Yahoo paths', async () => {
    const res = mockRes();
    await yahoo(req({ path: 'v7/finance/quote' }), res);
    expect(res.statusCode).toBe(404);
  });

  it('rejects non-GET methods', async () => {
    const res = mockRes();
    await coingecko(req({ path: 'api/v3/coins/markets' }, 'POST'), res);
    expect(res.statusCode).toBe(405);
  });

  it('hides upstream error details', async () => {
    fetch.mockRejectedValueOnce(new Error('getaddrinfo ENOTFOUND internal-host'));
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const res = mockRes();
    await coingecko(req({ path: 'api/v3/coins/markets' }), res);
    expect(res.statusCode).toBe(502);
    expect(JSON.stringify(res.body)).not.toContain('ENOTFOUND');
  });

  it('rate-limits a single IP', async () => {
    const r = { method: 'GET', query: { path: 'api/v3/coins/markets' }, headers: { 'x-forwarded-for': '1.2.3.4' } };
    let last;
    for (let i = 0; i < 101; i++) {
      last = mockRes();
      await coingecko(r, last);
    }
    expect(last.statusCode).toBe(429);
  });
});
