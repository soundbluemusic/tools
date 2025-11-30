import { test, expect } from '@playwright/test';

test.describe('Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should have skip link that focuses main content', async ({ page }) => {
    // Tab to focus skip link
    await page.keyboard.press('Tab');

    const skipLink = page.locator('.skip-link');

    // Skip link should be visible when focused
    await skipLink.focus();
    await expect(skipLink).toBeFocused();

    // Click skip link
    await skipLink.click();

    // Main content should be visible
    await expect(page.locator('#main-content')).toBeVisible();
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1);
  });

  test('should have proper ARIA landmarks', async ({ page }) => {
    // Main content area
    await expect(page.locator('main[role="main"]')).toBeVisible();
  });

  test('should support keyboard navigation on app cards', async ({ page }) => {
    // Tab to first app card
    await page.keyboard.press('Tab'); // Skip link
    await page.keyboard.press('Tab'); // Theme toggle
    await page.keyboard.press('Tab'); // Language toggle
    await page.keyboard.press('Tab'); // First app card

    // Enter should navigate
    await page.keyboard.press('Enter');
    await expect(page).not.toHaveURL('/');
  });

  test('should have accessible buttons with labels', async ({ page }) => {
    const themeToggle = page.locator('.theme-toggle');
    await expect(themeToggle).toHaveAttribute('aria-label');

    const langToggle = page.locator('.language-toggle');
    await expect(langToggle).toHaveAttribute('aria-label');
  });

  test('should respect reduced motion preference', async ({ page }) => {
    // Emulate reduced motion
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');

    // Page should still function normally
    await expect(page.locator('main')).toBeVisible();
  });
});

test.describe('Responsive Design', () => {
  test('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('.language-toggle')).toBeVisible();
    await expect(page.locator('.theme-toggle')).toBeVisible();
  });

  test('should work on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');

    await expect(page.locator('main')).toBeVisible();
  });

  test('should work on desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');

    await expect(page.locator('main')).toBeVisible();
  });
});
