import { expect, test } from '@playwright/test';

test('home lists all five tools and filters by keyword', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Small tasks');
  await expect(page.locator('.tool-card')).toHaveCount(5);
  await page.getByRole('textbox', { name: 'Search tools' }).fill('signature');
  await expect(page.locator('.tool-card')).toHaveCount(1);
  await expect(page.getByRole('link', { name: /Signature Resizer to 10 KB/i })).toBeVisible();
});

test('orders can be parsed and downloaded without a login', async ({ page }) => {
  await page.goto('/tools/whatsapp-order-to-csv/');
  await page.getByRole('button', { name: 'Load sample' }).click();
  await expect(page.getByText('5', { exact: true }).first()).toBeVisible();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download CSV' }).click();
  expect((await downloadPromise).suggestedFilename()).toBe('aetherexa-whatsapp-orders.csv');
});

test('date fixer flags ambiguous dates and downloads results', async ({ page }) => {
  await page.goto('/tools/csv-date-format-fixer/');
  await page.getByRole('button', { name: 'Load sample' }).click();
  await expect(page.getByText(/ambiguous dates were left unchanged/i)).toBeVisible();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download corrected CSV' }).click();
  expect((await downloadPromise).suggestedFilename()).toBe('aetherexa-fixed-dates.csv');
});

test('price list prints and exports CSV', async ({ page }) => {
  await page.goto('/tools/daily-price-list-maker/');
  await expect(page.locator('.price-sheet tbody tr')).toHaveCount(6);
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export CSV' }).click();
  expect((await downloadPromise).suggestedFilename()).toBe('aetherexa-price-list.csv');
});

test('image tools render an accessible upload and size controls', async ({ page }) => {
  for (const slug of ['exam-photo-resizer', 'signature-resize-10kb']) {
    await page.goto(`/tools/${slug}/`);
    await expect(page.getByLabel('Choose an image')).toBeVisible();
    await expect(page.getByLabel('Max size (KB)')).toBeVisible();
    await expect(page.getByRole('button', { name: /Resize and compress/i })).toBeDisabled();
  }
});


test('resizes an uploaded image completely in the browser', async ({ page }) => {
  await page.goto('/tools/exam-photo-resizer/');
  await page.getByLabel('Choose an image').setInputFiles('e2e/fixtures/sample-photo.png');
  await page.getByRole('button', { name: /Resize and compress/i }).click();
  await expect(page.getByText(/Meets the selected maximum file size/i)).toBeVisible();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download JPEG' }).click();
  expect((await downloadPromise).suggestedFilename()).toBe('aetherexa-exam-photo.jpg');
});

test('keyboard users can skip navigation', async ({ page, isMobile }) => {
  test.skip(isMobile, 'Mobile keyboard navigation is not simulated by this test.');
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused();
});
