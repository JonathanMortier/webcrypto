import { WEATHER_API_KEY, WEATHER_BASE_URL } from './constants.js';

const CACHE_PREFIX = 'cryptowatch_weather_';
const LOCATION_CACHE_KEY = CACHE_PREFIX + 'location';
const WEATHER_CACHE_TTL = 600_000;

function getFromLocalStorage(key) {
  try {
    const item = localStorage.getItem(key);
    if (!item) return null;
    const { data, timestamp } = JSON.parse(item);
    return { data, timestamp };
  } catch {
    return null;
  }
}

function setToLocalStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
  } catch (e) {
    console.warn('LocalStorage full or unavailable:', e);
  }
}

function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300_000 }
    );
  });
}

async function fetchLocationByIP() {
  const res = await fetch('https://ip-api.com/json/');
  if (!res.ok) throw new Error('IP geolocation failed');
  const data = await res.json();
  if (data.status === 'fail') throw new Error('IP geolocation returned fail');
  return { lat: data.lat, lon: data.lon, city: data.city, country: data.country };
}

export async function detectLocation() {
  const cached = getFromLocalStorage(LOCATION_CACHE_KEY);
  if (cached && (Date.now() - cached.timestamp) < 86_400_000) {
    return cached.data;
  }

  try {
    const { lat, lon } = await getCurrentPosition();
    const location = { lat, lon };
    setToLocalStorage(LOCATION_CACHE_KEY, location);
    return location;
  } catch {
    try {
      const ipData = await fetchLocationByIP();
      const location = { lat: ipData.lat, lon: ipData.lon, city: ipData.city };
      setToLocalStorage(LOCATION_CACHE_KEY, location);
      return location;
    } catch {
      return null;
    }
  }
}

export async function fetchWeather(lat, lon) {
  if (!WEATHER_API_KEY) return null;

  const cacheKey = `weather_${lat.toFixed(2)}_${lon.toFixed(2)}`;
  const cached = getFromLocalStorage(CACHE_PREFIX + cacheKey);
  if (cached && (Date.now() - cached.timestamp) < WEATHER_CACHE_TTL) {
    return cached.data;
  }

  try {
    const res = await fetch(
      `${WEATHER_BASE_URL}/current.json?key=${WEATHER_API_KEY}&q=${lat},${lon}&aqi=no`
    );
    if (!res.ok) throw new Error(`WeatherAPI HTTP ${res.status}`);
    const data = await res.json();
    const result = {
      temp: Math.round(data.current.temp_c),
      condition: data.current.condition.text,
      icon: data.current.condition.icon,
      code: data.current.condition.code,
      city: data.location.name,
      country: data.location.country,
    };
    setToLocalStorage(CACHE_PREFIX + cacheKey, result);
    return result;
  } catch (err) {
    console.warn('Weather fetch failed:', err);
    return null;
  }
}
