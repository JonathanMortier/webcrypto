import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Header from '../components/Header.jsx';

function renderHeader(props = {}, initialEntries = ['/']) {
  const defaults = {
    onRefresh: vi.fn(),
    lastUpdate: null,
    isLoading: false,
    countdown: 60,
    theme: 'dark',
    onThemeToggle: vi.fn(),
    searchQuery: '',
    onSearchChange: vi.fn(),
    favoritesCount: 0,
    showFavoritesOnly: false,
    onToggleFavoritesFilter: vi.fn(),
    notificationsEnabled: false,
    onToggleNotifications: vi.fn(),
  };
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Header {...defaults} {...props} />
    </MemoryRouter>,
  );
}

describe('Header', () => {
  it('should render title and subtitle on the dashboard route', () => {
    renderHeader();
    expect(screen.getByText('CryptoWatch')).toBeInTheDocument();
    expect(screen.getByText(/Suivez les cours des principales cryptomonnaies/)).toBeInTheDocument();
  });

  it('should call onSearchChange when typing in the search input', () => {
    const onSearchChange = vi.fn();
    renderHeader({ onSearchChange });
    fireEvent.change(screen.getByPlaceholderText(/Rechercher une crypto/), { target: { value: 'btc' } });
    expect(onSearchChange).toHaveBeenCalledWith('btc');
  });

  it('should bind the search input value to searchQuery', () => {
    renderHeader({ searchQuery: 'eth' });
    expect(screen.getByPlaceholderText(/Rechercher une crypto/)).toHaveValue('eth');
  });

  it('should call onRefresh when clicking the refresh button', () => {
    const onRefresh = vi.fn();
    renderHeader({ onRefresh });
    fireEvent.click(screen.getByRole('button', { name: /Actualiser/ }));
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it('should disable the refresh button while loading', () => {
    renderHeader({ isLoading: true });
    expect(screen.getByRole('button', { name: /Actualiser/ })).toBeDisabled();
  });

  it('should call onThemeToggle and show the light mode icon in dark mode', () => {
    const onThemeToggle = vi.fn();
    renderHeader({ theme: 'dark', onThemeToggle });
    expect(screen.getByText('☀️')).toBeInTheDocument();
    fireEvent.click(screen.getByTitle('Mode clair'));
    expect(onThemeToggle).toHaveBeenCalledTimes(1);
  });

  it('should show the dark mode icon in light mode', () => {
    renderHeader({ theme: 'light' });
    expect(screen.getByText('🌙')).toBeInTheDocument();
    expect(screen.getByTitle('Mode sombre')).toBeInTheDocument();
  });

  it('should call onToggleNotifications when clicking the notifications button', () => {
    const onToggleNotifications = vi.fn();
    renderHeader({ onToggleNotifications });
    fireEvent.click(screen.getByTitle('Activer les notifications'));
    expect(onToggleNotifications).toHaveBeenCalledTimes(1);
  });

  it('should mark the notifications button as active when enabled', () => {
    renderHeader({ notificationsEnabled: true });
    const btn = screen.getByTitle('Désactiver les notifications');
    expect(btn).toHaveClass('active');
  });

  it('should call onToggleFavoritesFilter and display the favorites count', () => {
    const onToggleFavoritesFilter = vi.fn();
    renderHeader({ favoritesCount: 3, onToggleFavoritesFilter });
    expect(screen.getByText('3')).toBeInTheDocument();
    fireEvent.click(screen.getByTitle('Voir uniquement les favoris'));
    expect(onToggleFavoritesFilter).toHaveBeenCalledTimes(1);
  });

  it('should mark the favorites filter button as active when enabled', () => {
    renderHeader({ showFavoritesOnly: true });
    expect(screen.getByTitle('Voir toutes les cryptos')).toHaveClass('active');
  });

  it('should show the last update line with the countdown', () => {
    renderHeader({ lastUpdate: new Date(2026, 7, 30, 10, 30, 0), countdown: 30 });
    expect(screen.getByText(/Prochaine actualisation dans 30s/)).toBeInTheDocument();
    expect(screen.getByText(/Dernière mise à jour:/)).toBeInTheDocument();
  });

  it('should hide subtitle, search, favorites and notifications on the bourse route', () => {
    renderHeader({}, ['/bourse']);
    expect(screen.queryByText(/Suivez les cours des principales cryptomonnaies/)).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/Rechercher une crypto/)).not.toBeInTheDocument();
    expect(screen.queryByTitle('Voir uniquement les favoris')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Activer les notifications')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Actualiser/ })).toBeInTheDocument();
  });
});
