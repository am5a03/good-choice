import { readFileSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { ProductSchema } from '../shared/models';

const args = process.argv.slice(2);
if (args.includes('--local') === args.includes('--remote')) throw new Error('Choose exactly one of --local or --remote.');
if (args.includes('--remote') && !args.includes('--confirm-demo')) throw new Error('This imports FICTIONAL products. Add --confirm-demo explicitly to seed a remote demo database.');
const target = args.includes('--remote') ? '--remote' : '--local';
const records: unknown[] = JSON.parse(readFileSync('db/seed/products.json', 'utf8'));
const products = records.map((record) => ProductSchema.parse({ ...(record as Record<string, unknown>), source: 'Fictional demo dataset', isDemo: true }));
const quote = (value: unknown): string => value == null ? 'NULL' : typeof value === 'number' ? String(value) : `'${String(value).replaceAll("'", "''")}'`;
const insert = (table: string, data: Record<string, unknown>) => `INSERT INTO ${table} (${Object.keys(data).join(', ')}) VALUES (${Object.values(data).map(quote).join(', ')}) ON CONFLICT DO NOTHING;`;
// Fixed fixture timestamp: NOT an actual retail observation or a verification date.
const fixtureTime = '2026-09-20T00:00:00.000Z';
const statements: string[] = [];
for (const product of products) {
  const { color, dark, scene, line1, line2, sub, type } = product;
  statements.push(insert('products', { id: product.id, barcode: product.barcode, brand: product.brand, name: product.name, category: product.category, market: 'CA', ingredients: product.ingredients === null ? null : JSON.stringify(product.ingredients), allergens: product.allergens, artwork: JSON.stringify({ color, dark, scene, line1, line2, sub, type }), source: product.source, is_demo: 1, created_at: fixtureTime, updated_at: fixtureTime }));
  const { addedSugars, ...nutrients } = product.nutrients;
  statements.push(insert('nutrition', { product_id: product.id, ...nutrients, added_sugars: addedSugars, source: product.source }));
  if (product.price !== null && product.weight !== null) statements.push(insert('price_observations', { id: `demo-${product.id}`, product_id: product.id, price_cents: Math.round(product.price * 100), package_grams: product.weight, currency: 'CAD', source: 'Fictional price fixture', observed_at: fixtureTime }));
}
mkdirSync('.tmp', { recursive: true });
const file = '.tmp/seed-demo.sql';
try {
  writeFileSync(file, statements.join('\n') + '\n');
  console.log(`Seeding ${products.length} fictional products ${target}. Existing records are not overwritten.`);
  execFileSync(process.platform === 'win32' ? 'npx.cmd' : 'npx', ['wrangler', 'd1', 'execute', 'good-choice-db', target, '--file', file], { stdio: 'inherit' });
} finally { rmSync(file, { force: true }); }
