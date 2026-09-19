import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import NavMenu from '../components/NavMenu.jsx';

function LocationDisplay() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}</div>;
}

function renderNavMenu(initialEntries = ['/']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <NavMenu />
      <LocationDisplay />
    </MemoryRouter>,
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('NavMenu', () => {
  it('should be closed by default', () => {
    renderNavMenu();
    expect(screen.getByRole('button', { name: 'Menu' })).toBeInTheDocument();
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('should open the dropdown when clicking the hamburger button', () => {
    renderNavMenu();
    fireEvent.click(screen.getByRole('button', { name: 'Menu' }));
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /CryptoWatch/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Bourse/ })).toBeInTheDocument();
  });

  it('should close the dropdown when clicking the hamburger button again', () => {
    renderNavMenu();
    const btn = screen.getByRole('button', { name: 'Menu' });
    fireEvent.click(btn);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    fireEvent.click(btn);
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('should close the dropdown when clicking outside the menu', () => {
    renderNavMenu();
    fireEvent.click(screen.getByRole('button', { name: 'Menu' }));
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('should not close the dropdown when clicking inside the menu', () => {
    renderNavMenu();
    fireEvent.click(screen.getByRole('button', { name: 'Menu' }));
    const nav = screen.getByRole('navigation');
    fireEvent.mouseDown(nav);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('should mark the current route link as active on /', () => {
    renderNavMenu(['/']);
    fireEvent.click(screen.getByRole('button', { name: 'Menu' }));
    expect(screen.getByRole('link', { name: /CryptoWatch/ })).toHaveClass('active');
    expect(screen.getByRole('link', { name: /Bourse/ })).not.toHaveClass('active');
  });

  it('should mark the bourse link as active on /bourse', () => {
    renderNavMenu(['/bourse']);
    fireEvent.click(screen.getByRole('button', { name: 'Menu' }));
    expect(screen.getByRole('link', { name: /Bourse/ })).toHaveClass('active');
    expect(screen.getByRole('link', { name: /CryptoWatch/ })).not.toHaveClass('active');
  });

  it('should navigate to /bourse and close the menu when clicking the Bourse link', () => {
    renderNavMenu(['/']);
    fireEvent.click(screen.getByRole('button', { name: 'Menu' }));
    fireEvent.click(screen.getByRole('link', { name: /Bourse/ }));
    expect(screen.getByTestId('location')).toHaveTextContent('/bourse');
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('should navigate back to / and close the menu when clicking the CryptoWatch link', () => {
    renderNavMenu(['/bourse']);
    fireEvent.click(screen.getByRole('button', { name: 'Menu' }));
    fireEvent.click(screen.getByRole('link', { name: /CryptoWatch/ }));
    expect(screen.getByTestId('location')).toHaveTextContent('/');
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });
});
