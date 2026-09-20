import { expect, test } from '@playwright/test';
import { defaultShelf } from '../../shared/shelf';

test('changes the recommendation when the priority changes', async ({ page }) => {
  await page.goto('/compare');
  await expect(page.getByTestId('decision-title')).toHaveText('Consider Fieldwork.');
  await page.getByRole('button', { name: 'Less sugar', exact: true }).click();
  await expect(page.getByTestId('decision-title')).toHaveText('Your usual fits this priority.');
  await page.reload();
  await expect(page.getByRole('button', { name: 'Less sugar', exact: true })).toHaveAttribute('aria-pressed', 'true');
});
test('uses equivalent quantities and supports a custom bowl', async ({ page }) => {
  await page.goto('/compare'); await expect(page.getByTestId('decision-title')).toBeVisible();
  await page.getByRole('button', { name: 'My bowl', exact: true }).click();
  await expect(page.getByRole('row', { name: /Fibre/ })).toContainText('6.4 g');
  await page.getByLabel('Bowl size in grams').fill('60'); await page.getByLabel('Bowl size in grams').press('Tab');
  await expect(page.getByRole('row', { name: /Fibre/ })).toContainText('9.6 g');
});
test('saves and reopens a comparison', async ({ page }) => {
  await page.goto('/compare'); await page.getByRole('button', { name: 'Save comparison', exact: true }).click();
  await page.goto('/shelf'); await page.getByRole('button', { name: 'Saved comparisons (1)' }).click();
  await page.getByRole('button', { name: 'Reopen comparison' }).click();
  await expect(page.getByTestId('decision-title')).toHaveText('Consider Fieldwork.');
});
test('shows missing information rather than inventing a winner', async ({ page }) => {
  await page.goto('/shop'); await page.getByRole('button', { name: 'Add Small-batch Granola to comparison', exact: true }).click();
  await page.goto('/compare'); await expect(page.getByTestId('decision-title')).toHaveText('A little more information first.');
});
test('handles a genuine tie', async ({ page }) => {
  await page.goto('/compare'); await page.getByRole('button', { name: 'Remove Bran & Seed Flakes', exact: true }).click();
  await page.goto('/shop'); await page.getByRole('button', { name: 'Add Heritage Oat Flakes to comparison', exact: true }).click();
  await page.goto('/compare'); await expect(page.getByTestId('decision-title')).toHaveText('No single winner for this priority.');
});
test('persists manual entries without inventing missing nutrients', async ({ page }) => {
  await page.goto('/shop'); await page.getByRole('button', { name: 'Add a label', exact: true }).first().click();
  await page.getByRole('dialog').getByLabel('Product name', { exact: true }).fill('My test cereal');
  await page.getByRole('button', { name: 'Save unverified label', exact: true }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible(); await page.reload();
  await expect(page.getByRole('button', { name: 'View My test cereal', exact: true })).toBeVisible();
  await page.goto('/compare'); await expect(page.getByTestId('decision-title')).toHaveText('A little more information first.');
});
test('imports the original prototype format and exports the migrated shelf', async ({ page }) => {
  await page.goto('/settings');
  await page.getByLabel('Import shelf JSON').setInputFiles({ name: 'legacy.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({ settings: { ...defaultShelf(), version: 1, metric: 'sodium' } })) });
  await page.getByRole('button', { name: 'Replace my local shelf' }).click();
  const download = page.waitForEvent('download'); await page.getByRole('button', { name: 'Export my shelf', exact: true }).click();
  expect((await download).suggestedFilename()).toBe('goodchoice-my-shelf.json');
  await page.goto('/compare'); await expect(page.getByRole('button', { name: 'Less sodium', exact: true })).toHaveAttribute('aria-pressed', 'true');
});
test('reads D1, paginates, and keeps unknown API routes out of the SPA fallback', async ({ request }) => {
  const first = await request.get('/api/products?limit=2'); expect(first.ok()).toBeTruthy(); const a = await first.json(); expect(a.total).toBe(8); expect(a.items).toHaveLength(2);
  const second = await (await request.get('/api/products?limit=2&offset=2')).json(); expect(a.items[0].id).not.toBe(second.items[0].id);
  const barcode = await (await request.get('/api/barcodes/DEMO002')).json(); expect(barcode.id).toBe('field');
  const unknown = await (await request.get('/api/products/unknown')).json(); expect(unknown.nutrients.fibre).toBeNull(); expect(unknown.ingredients).toBeNull();
  const missing = await request.get('/api/does-not-exist'); expect(missing.status()).toBe(404); expect(missing.headers()['content-type']).toContain('application/json');
  expect((await request.post('/api/products', { data: {} })).status()).toBe(405);
});
test('renders responsive pages without document overflow or browser errors', async ({ page }, testInfo) => {
  const errors: string[] = []; page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/compare'); await expect(page.getByTestId('decision-title')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBeTruthy();
  await page.screenshot({ path: testInfo.outputPath('compare.png'), fullPage: true });
  await page.goto('/shop'); await expect(page.getByRole('button', { name: 'View Original Oat Rings', exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBeTruthy();
  await page.screenshot({ path: testInfo.outputPath('shop.png'), fullPage: true });
  expect(errors).toEqual([]);
});
