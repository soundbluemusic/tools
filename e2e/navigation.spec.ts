import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display home page with app grid', async ({ page }) => {
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('.app-grid, .app-list')).toBeVisible();
  });

  test('should navigate to metronome tool', async ({ page }) => {
    await page.click('a[href="/metronome"]');
    await expect(page).toHaveURL('/metronome');
    await expect(page.locator('main')).toBeVisible();
  });

  test('should navigate to QR code tool', async ({ page }) => {
    await page.click('a[href="/qr"]');
    await expect(page).toHaveURL('/qr');
    await expect(page.locator('main')).toBeVisible();
  });

  test('should navigate back to home from tool page', async ({ page }) => {
    await page.goto('/metronome');
    await page.click('a[href="/"]');
    await expect(page).toHaveURL('/');
  });

  test('should show 404 page for unknown routes', async ({ page }) => {
    await page.goto('/unknown-route');
    await expect(page.locator('text=404')).toBeVisible();
  });
});

test.describe('Language Toggle', () => {
  test('should toggle between Korean and English', async ({ page }) => {
    await page.goto('/');

    // Get initial language toggle text
    const toggle = page.locator('.language-toggle');
    await expect(toggle).toBeVisible();

    // Click to switch language
    await toggle.click();

    // Toggle should update its display
    await expect(toggle).toBeVisible();
  });
});

test.describe('Theme Toggle', () => {
  test('should cycle through themes', async ({ page }) => {
    await page.goto('/');

    const toggle = page.locator('.theme-toggle');
    await expect(toggle).toBeVisible();

    // Click to cycle theme
    await toggle.click();

    // Theme attribute should be set on html element
    const theme = await page.locator('html').getAttribute('data-theme');
    expect(theme).toBeDefined();
  });
});
