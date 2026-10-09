import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
for (const route of ['/', '/tools/whatsapp-order-to-csv/', '/tools/csv-date-format-fixer/', '/tools/daily-price-list-maker/', '/tools/exam-photo-resizer/', '/tools/signature-resize-10kb/', '/privacy/']) {
  test(`basic WCAG A/AA accessibility check: ${route}`, async ({page}) => {
    await page.goto(route);
    const report = await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
    expect(report.violations, JSON.stringify(report.violations.map(v => ({id:v.id,impact:v.impact,description:v.description})),null,2)).toEqual([]);
  });
}
