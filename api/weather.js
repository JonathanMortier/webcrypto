import { getClientIp, isRateLimited, USER_AGENT } from './_proxy.js';

// Server-side WeatherAPI.com proxy: the API key never reaches the browser.
// Requires the WEATHER_API_KEY environment variable (NOT prefixed with VITE_).

function parseCoord(value, max) {
  const raw = String([].concat(value ?? '')[0]).trim();
  const n = Number(raw);
  if (raw === '' || !Number.isFinite(n) || Math.abs(n) > max) return null;
  // Round to ~1 km: enough for weather, avoids forwarding precise positions.
  return Math.round(n * 100) / 100;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (isRateLimited(getClientIp(req))) {
    return res.status(429).json({ error: 'Too many requests, please try again later' });
  }

  const lat = parseCoord(req.query.lat, 90);
  const lon = parseCoord(req.query.lon, 180);
  if (lat === null || lon === null) {
    return res.status(400).json({ error: 'Invalid coordinates' });
  }

  const key = process.env.WEATHER_API_KEY;
  if (!key) {
    return res.status(503).json({ error: 'Weather service not configured' });
  }

  const params = new URLSearchParams({ key, q: `${lat},${lon}`, aqi: 'no' });
  try {
    const response = await fetch(`https://api.weatherapi.com/v1/current.json?${params}`, {
      headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
    });
    if (!response.ok) {
      console.error('WeatherAPI error:', response.status);
      return res.status(502).json({ error: 'Upstream request failed' });
    }
    const data = await response.text();
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    // Same 10-minute TTL as the client cache; lets Vercel's edge absorb repeat calls.
    res.setHeader('Cache-Control', 'public, s-maxage=600, max-age=0');
    return res.status(200).send(data);
  } catch (error) {
    console.error('Weather proxy error:', error.message);
    return res.status(502).json({ error: 'Upstream request failed' });
  }
}
