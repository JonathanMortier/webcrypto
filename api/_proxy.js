// Shared logic for the Vercel serverless proxies (files prefixed with "_" are not exposed as routes).

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

// Best-effort per-instance rate limit. Serverless instances do not share memory,
// so this only slows down abuse; use Vercel Firewall rules for a hard limit.
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 100;
const hits = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now - entry.start > WINDOW_MS) {
    hits.set(ip, { start: now, count: 1 });
    if (hits.size > 10_000) hits.clear();
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_REQUESTS;
}

function buildQueryString(query) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (key === 'path') continue;
    for (const v of [].concat(value)) params.append(key, v);
  }
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

/**
 * Create a GET-only JSON proxy to `baseUrl`, restricted to paths matching `allowedPaths`.
 */
export function createProxy(baseUrl, allowedPaths) {
  return async function handler(req, res) {
    if (req.method !== 'GET') {
      res.setHeader('Allow', 'GET');
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const ip =
      String(req.headers['x-forwarded-for'] || '')
        .split(',')[0]
        .trim() || 'unknown';
    if (isRateLimited(ip)) {
      return res.status(429).json({ error: 'Too many requests, please try again later' });
    }

    const path = String([].concat(req.query.path ?? '')[0]);
    if (path.includes('..') || !allowedPaths.some((re) => re.test(path))) {
      return res.status(404).json({ error: 'Not found' });
    }

    try {
      const response = await fetch(`${baseUrl}/${path}${buildQueryString(req.query)}`, {
        headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
      });
      const data = await response.text();
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      return res.status(response.status).send(data);
    } catch (error) {
      console.error('Proxy error:', error);
      return res.status(502).json({ error: 'Upstream request failed' });
    }
  };
}
