import { cpSync, existsSync, mkdtempSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, resolve } from 'node:path';
import config from '../drizzle.config';

if (!existsSync('db/migrations/meta/_journal.json')) {
  throw new Error('Missing Drizzle journal. Generate and commit migrations with npm run db:generate.');
}
mkdirSync('.tmp', { recursive: true });
const target = mkdtempSync(join('.tmp', 'migration-check-'));
const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';
try {
  cpSync('db/migrations', target, { recursive: true });
  const before = readdirSync(target).filter((file) => file.endsWith('.sql')).sort().join('\n');
  execFileSync(npx, ['drizzle-kit', 'check', '--config=drizzle.config.ts'], { stdio: 'inherit' });
  // Drizzle Kit does not allow --config together with an --out CLI override.
  // A temporary copy of the config checks drift without touching committed history.
  const schema = config.schema;
  if (!schema) throw new Error('The Drizzle schema path must be configured.');
  const checkConfig = join(target, 'drizzle-check.config.ts');
  const isolated = {
    ...config,
    schema: Array.isArray(schema) ? schema.map((file) => resolve(file)) : resolve(schema),
    out: resolve(target),
  };
  writeFileSync(checkConfig, `export default ${JSON.stringify(isolated, null, 2)};\n`);
  execFileSync(npx, ['drizzle-kit', 'generate', `--config=${checkConfig}`, '--name=ci_schema_drift'], { stdio: 'inherit' });
  const after = readdirSync(target).filter((file) => file.endsWith('.sql')).sort().join('\n');
  if (before !== after) throw new Error('Schema drift: generate, review and commit a new migration and its metadata.');
  console.log('Migration snapshots match the Drizzle schema.');
} finally { rmSync(target, { recursive: true, force: true }); }
