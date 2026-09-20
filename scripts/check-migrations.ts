import { cpSync, existsSync, mkdtempSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

if (!existsSync('db/migrations/meta/_journal.json')) throw new Error('Missing Drizzle journal. Generate and commit migrations with npm run db:generate.');
mkdirSync('.tmp', { recursive: true });
const target = mkdtempSync(join('.tmp', 'migration-check-'));
const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';
try {
  cpSync('db/migrations', target, { recursive: true });
  const before = readdirSync(target).filter((file) => file.endsWith('.sql')).sort().join('\n');
  execFileSync(npx, ['drizzle-kit', 'check', '--config=drizzle.config.ts'], { stdio: 'inherit' });
  execFileSync(npx, ['drizzle-kit', 'generate', '--config=drizzle.config.ts', `--out=${target}`, '--name=ci_schema_drift'], { stdio: 'inherit' });
  const after = readdirSync(target).filter((file) => file.endsWith('.sql')).sort().join('\n');
  if (before !== after) throw new Error('Schema drift: generate, review and commit a new migration and its metadata.');
  console.log('Migration snapshots match the Drizzle schema.');
} finally { rmSync(target, { recursive: true, force: true }); }
