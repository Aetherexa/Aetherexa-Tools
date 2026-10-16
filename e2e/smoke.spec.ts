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

test('all pages display Aetherexa theme instead of bare unstyled HTML', async ({ page }) => {
  const routes = ['/', '/privacy/', '/tools/whatsapp-order-to-csv/', '/tools/csv-date-format-fixer/', '/tools/daily-price-list-maker/', '/tools/exam-photo-resizer/', '/tools/signature-resize-10kb/'];
  for (const route of routes) {
    await page.goto(route);
    const styles = await page.evaluate(() => {
      const header = document.querySelector('.main-header');
      return {
        inlineCss: Array.from(document.querySelectorAll('head style')).some(style => style.textContent?.includes('--ax-bg:')),
        background: getComputedStyle(document.body).backgroundImage,
        headerHeight: header ? getComputedStyle(header).height : '',
        font: getComputedStyle(document.body).fontFamily,
      };
    });
    expect(styles.inlineCss, `Missing inlined stylesheet at ${route}`).toBe(true);
    expect(styles.background).toContain('gradient');
    expect(styles.font).toContain('Inter');
    expect(parseFloat(styles.headerHeight)).toBeGreaterThan(55);
  }
});


test('imported WhatsApp chat retains customer association in the CSV preview', async ({page}) => {
  await page.goto('/tools/whatsapp-order-to-csv/');
  await page.getByLabel('Import exported chat (.txt)').setInputFiles({
    name: 'whatsapp-chat.txt', mimeType: 'text/plain',
    buffer: Buffer.from('[16/10/2026, 9:00 PM] Anita: 2 kg Rice\n3x Soap\n16/10/2026, 9:03 PM - Ravi: Sugar 1 kg'),
  });
  await expect(page.locator('.data-table tbody tr')).toHaveCount(3);
  await expect(page.locator('.data-table tbody tr').last()).toContainText('Ravi');
  const download = page.waitForEvent('download');
  await page.getByRole('button',{name:'Download CSV'}).click();
  expect((await download).suggestedFilename()).toBe('aetherexa-whatsapp-orders.csv');
});

test('TSV upload autodetects separator and exports a TSV file', async ({page}) => {
  await page.goto('/tools/csv-date-format-fixer/');
  await page.getByLabel('Upload CSV or TSV').setInputFiles({
    name:'dates.tsv',mimeType:'text/tab-separated-values',
    buffer:Buffer.from('name\tdate\nAsha\t31/12/2025'),
  });
  await expect(page.getByLabel('CSV delimiter')).toHaveValue('\t');
  await expect(page.locator('.data-table tbody tr')).toContainText(['Asha2025-12-31']);
  const download = page.waitForEvent('download');
  await page.getByRole('button',{name:'Download corrected CSV'}).click();
  expect((await download).suggestedFilename()).toBe('aetherexa-fixed-dates.tsv');
});

test('price maker imports its own exported CSV without treating the header as invalid', async ({page}) => {
  await page.goto('/tools/daily-price-list-maker/');
  await page.getByLabel('Import a CSV or text price list').setInputFiles({
    name:'prices.csv',mimeType:'text/csv',
    buffer:Buffer.from('item,price,unit\nRice,65,kg\nSoap,35,each'),
  });
  await expect(page.locator('.price-sheet tbody tr')).toHaveCount(2);
  await expect(page.getByText('line(s) could not be parsed')).toHaveCount(0);
});

test('image tool shows unsupported file errors instead of silently clearing them', async ({page}) => {
  await page.goto('/tools/signature-resize-10kb/');
  await page.getByLabel('Choose an image').setInputFiles({
    name:'unsafe.svg',mimeType:'image/svg+xml',
    buffer:Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>'),
  });
  await expect(page.getByRole('alert')).toContainText('SVG is not supported');
  await expect(page.getByRole('button',{name:/Resize and compress/})).toBeDisabled();
});
