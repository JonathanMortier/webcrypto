import { test, expect } from '@playwright/test';

test.describe('CryptoWatch Dashboard', () => {
  test('loads and displays crypto cards', async ({ page }) => {
    await page.goto('/');

    const cards = page.locator('.crypto-card');
    await expect(cards.first()).toBeVisible({ timeout: 15000 });
    expect(await cards.count()).toBeGreaterThanOrEqual(1);
  });

  test('search filters crypto cards', async ({ page }) => {
    await page.goto('/');

    const searchInput = page.locator('input.search-input');
    await expect(searchInput).toBeVisible({ timeout: 10000 });
    await searchInput.fill('bitcoin');

    const cards = page.locator('.crypto-card');
    await expect(cards.first()).toBeVisible({ timeout: 10000 });

    const count = await cards.count();
    for (let i = 0; i < count; i++) {
      const name = await cards.nth(i).locator('.crypto-name').textContent();
      expect(name?.toLowerCase()).toContain('bitcoin');
    }
  });

  test('theme toggle switches dark/light', async ({ page }) => {
    await page.goto('/');

    const html = page.locator('html');
    const themeToggle = page.locator('button.theme-toggle-btn');

    await expect(themeToggle).toBeVisible({ timeout: 10000 });
    const initialTheme = await html.getAttribute('data-theme');

    await themeToggle.click();
    await page.waitForTimeout(500);

    const newTheme = await html.getAttribute('data-theme');
    expect(newTheme).not.toBe(initialTheme);
  });

  test('navigation to Bourse page works', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('.crypto-card').first()).toBeVisible({ timeout: 15000 });

    const menuButton = page.locator('button.hamburger-btn');
    await expect(menuButton).toBeVisible({ timeout: 10000 });
    await menuButton.click();

    const bourseLink = page.locator('a.nav-item', { hasText: 'Bourse' });
    await expect(bourseLink).toBeVisible({ timeout: 5000 });
    await bourseLink.click();

    await expect(page.locator('.index-card').first()).toBeVisible({ timeout: 15000 });
  });

  test('favorite toggle works', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('.crypto-card').first()).toBeVisible({ timeout: 15000 });

    const favButton = page.locator('button.favorite-btn').first();
    await expect(favButton).toBeVisible({ timeout: 5000 });
    await favButton.click();

    await expect(favButton).toHaveClass(/active/);
  });
});
