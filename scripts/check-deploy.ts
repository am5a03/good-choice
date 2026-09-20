import { readFileSync } from 'node:fs';
const config = JSON.parse(readFileSync('wrangler.jsonc', 'utf8'));
const id: unknown = config.d1_databases?.find((entry: { binding: string }) => entry.binding === 'DB')?.database_id;
if (typeof id !== 'string' || !/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(id) || /^0{8}-/.test(id)) {
  console.error('Create a D1 database with: npx wrangler d1 create good-choice-db\nThen put its database_id in wrangler.jsonc. Remote operations are blocked until configured.');
  process.exit(1);
}
