/* global process */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import coingecko from '../../api/coingecko.js';
import yahoo from '../../api/yahoo.js';
import weather from '../../api/weather.js';

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

describe('Weather proxy', () => {
  const ORIGINAL_KEY = process.env.WEATHER_API_KEY;

  beforeEach(() => {
    process.env.WEATHER_API_KEY = 'secret-key';
    globalThis.fetch = vi.fn(async () => ({
      ok: true,
      status: 200,
      text: async () => '{"current":{}}',
    }));
  });
  afterEach(() => {
    process.env.WEATHER_API_KEY = ORIGINAL_KEY;
    vi.restoreAllMocks();
  });

  it('adds the key server-side and rounds coordinates', async () => {
    const res = mockRes();
    await weather(req({ lat: '48.856613', lon: '2.352222' }), res);
    const url = new URL(fetch.mock.calls[0][0]);
    expect(url.origin + url.pathname).toBe('https://api.weatherapi.com/v1/current.json');
    expect(url.searchParams.get('key')).toBe('secret-key');
    expect(url.searchParams.get('q')).toBe('48.86,2.35');
    expect(res.statusCode).toBe(200);
    expect(res.headers['Cache-Control']).toContain('s-maxage=600');
  });

  it.each([
    [{ lat: 'abc', lon: '2' }],
    [{ lat: '95', lon: '2' }],
    [{ lat: '48', lon: '-181' }],
    [{ lat: '48' }],
    [{ lat: '48', lon: '2&key=other' }],
  ])('rejects invalid coordinates %j', async (query) => {
    const res = mockRes();
    await weather(req(query), res);
    expect(res.statusCode).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('returns 503 when the key is not configured', async () => {
    delete process.env.WEATHER_API_KEY;
    const res = mockRes();
    await weather(req({ lat: '48', lon: '2' }), res);
    expect(res.statusCode).toBe(503);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('never leaks the key or upstream details on error', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    fetch.mockResolvedValueOnce({ ok: false, status: 401, text: async () => '{"error":"API key secret-key invalid"}' });
    const res = mockRes();
    await weather(req({ lat: '48', lon: '2' }), res);
    expect(res.statusCode).toBe(502);
    expect(JSON.stringify(res.body)).not.toContain('secret-key');
  });

  it('rejects non-GET methods', async () => {
    const res = mockRes();
    await weather(req({ lat: '48', lon: '2' }, 'POST'), res);
    expect(res.statusCode).toBe(405);
  });
});
