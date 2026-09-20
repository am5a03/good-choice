import { defineConfig } from 'drizzle-kit';

// Generation is offline and credential-free. Wrangler is the only migration runner.
// Do not point drizzle-kit at a randomly discovered .wrangler SQLite file.
export default defineConfig({
  dialect: 'sqlite',
  schema: './server/db/schema.ts',
  out: './db/migrations',
  strict: true,
  verbose: true,
  breakpoints: true,
});
