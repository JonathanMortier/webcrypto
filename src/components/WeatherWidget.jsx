import { useState, useEffect } from 'react';
import { detectLocation, fetchWeather } from '../core/weatherApi.js';

export default function WeatherWidget() {
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const location = await detectLocation();
      if (!location || cancelled) {
        if (!location) setError(true);
        return;
      }
      const data = await fetchWeather(location.lat, location.lon);
      if (cancelled) return;
      if (data) {
        setWeather(data);
      } else {
        setError(true);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  if (error || !weather) return null;

  return (
    <div className="indicator weather-widget" title={`${weather.condition} · ${weather.city}, ${weather.country}`}>
      <span className="indicator-label">{weather.city}</span>
      <span className="indicator-value weather-value">
        <img
          className="weather-icon"
          src={weather.icon}
          alt={weather.condition}
          width="24"
          height="24"
        />
        {weather.temp}°C
      </span>
    </div>
  );
}
