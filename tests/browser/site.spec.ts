import { test, expect } from '@playwright/test';
test('public site renders without SDK, extra network calls or overflow', async ({ page }) => {
  const failures: string[] = [];
  page.on('pageerror', (e) => failures.push(e.message));
  const remote: string[] = [];
  page.on('request', (r) => {
    if (
      !r.url().startsWith('http://127.0.0.1:4322') &&
      !r
        .url()
        .startsWith(
          'https://juku-attendance-system.juku-matsuokakoki.workers.dev/public/v1/closures?',
        )
    )
      remote.push(r.url());
  });
  await page.goto('/');
  await expect(page.locator('h1')).toContainText('一輝塾');
  await expect(page.locator('.admission-strip')).toContainText('高校３年生');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(remote).toEqual([]);
  expect(failures).toEqual([]);
});
test('courses, contact and annual achievements are reachable', async ({ page }) => {
  await page.goto('/courses/');
  await expect(page.locator('#junior')).toContainText('3,800円');
  await page.goto('/achievements/');
  await page.getByRole('link', { name: '2025年度' }).click();
  await expect(page.locator('h1')).toHaveText('2025年度 合格実績');
  await page.goto('/contact/');
  await expect(page.locator('main a[href^="tel:"]')).toHaveAttribute('href', 'tel:080-6904-4450');
});
test('news has a working detail page and escaped content', async ({ page }) => {
  await page.goto('/news/');
  await page.locator('.news-list a').first().click();
  await expect(page.locator('main h1')).toContainText('試しに');
  await expect(page.locator('.rich-text')).toBeVisible();
});
test('content remains usable with JavaScript disabled', async ({ browser }) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4322/');
  await expect(page.locator('h1')).toBeVisible();
  await page.locator('summary').click();
  await expect(page.getByRole('navigation', { name: 'モバイルナビゲーション' })).toBeVisible();
  await context.close();
});

test('live closures preserve dates, Sundays and last success after failure', async ({ page }) => {
  let failing = false;
  await page.route('**/public/v1/closures?*', async (route) => {
    if (failing) return route.abort();
    await route.fulfill({
      json: {
        version: 1,
        timezone: 'Asia/Tokyo',
        closures: [{ date: '2026-11-03', reason: '<祝日>' }],
      },
    });
  });
  await page.goto('/calendar/2026-11/');
  await page.evaluate(() => window.dispatchEvent(new Event('online')));
  const day = page.locator('[data-date="2026-11-03"]');
  await expect(day).toContainText('<祝日>');
  await expect(page.locator('[data-date="2026-11-01"]')).toContainText('定休日');
  failing = true;
  await page.evaluate(() => window.dispatchEvent(new Event('online')));
  await expect(page.locator('[data-calendar-status]')).toContainText('前回確認した');
  await expect(day).toContainText('<祝日>');
  await expect(day).toHaveClass(/closed/);
});
