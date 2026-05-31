import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import WeatherWidget from '../components/WeatherWidget.jsx';

const { mockDetectLocation, mockFetchWeather } = vi.hoisted(() => ({
  mockDetectLocation: vi.fn(),
  mockFetchWeather: vi.fn(),
}));

vi.mock('../core/weatherApi.js', () => ({
  detectLocation: mockDetectLocation,
  fetchWeather: mockFetchWeather,
}));

beforeEach(() => {
  mockDetectLocation.mockResolvedValue({ lat: 48.85, lon: 2.35 });
  mockFetchWeather.mockResolvedValue({
    temp: 22, condition: 'Sunny',
    icon: '//cdn.weatherapi.com/weather/64x64/day/113.png',
    city: 'Paris', country: 'France',
  });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('WeatherWidget', () => {
  it('should render temperature and city name', async () => {
    render(<WeatherWidget />);
    await waitFor(() => {
      expect(screen.getByText('22°C')).toBeInTheDocument();
    }, { timeout: 2000 });
    expect(screen.getByText('Paris')).toBeInTheDocument();
  });

  it('should render weather icon', async () => {
    render(<WeatherWidget />);
    await waitFor(() => {
      const img = screen.getByAltText('Sunny');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', expect.stringContaining('113.png'));
    }, { timeout: 2000 });
  });

  it('should have a tooltip with condition and location', async () => {
    render(<WeatherWidget />);
    await waitFor(() => {
      const indicator = document.querySelector('.weather-widget');
      expect(indicator).toHaveAttribute('title', 'Sunny · Paris, France');
    }, { timeout: 2000 });
  });

  it('should render null when geolocation fails', async () => {
    mockDetectLocation.mockResolvedValue(null);
    const { container } = render(<WeatherWidget />);
    await new Promise(r => setTimeout(r, 500));
    expect(container.innerHTML).toBe('');
  });

  it('should render null when weather fetch fails', async () => {
    mockFetchWeather.mockResolvedValue(null);
    const { container } = render(<WeatherWidget />);
    await new Promise(r => setTimeout(r, 500));
    expect(container.innerHTML).toBe('');
  });
});
