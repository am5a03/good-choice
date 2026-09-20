# Database schema, migrations, and fixtures

Read when changing database structure, migration history, or seed data.

## Schema workflow

Edit `server/db/schema.ts` first, then generate a migration:

```sh
npm run db:generate -- --name=describe_the_change
```

Review the generated SQL, then check and apply it locally:

```sh
npm run db:check
npm run db:migrate:local
```

- Commit generated SQL, snapshots, and the journal together under `db/migrations/`.
- Never rewrite applied migrations; generate a new migration instead.
- Wrangler is the migration application path. Do not add `drizzle-kit push` or a parallel migration runner.

## Fixtures and ingestion

- Keep fictional fixtures in `db/seed/` separate from schema migrations and real product ingestion.
- Never seed production implicitly. Follow [deployment guidance](../deployment.md) for deliberately seeding an authorized demo deployment.
- Before adding real ingestion or catalog writes, read [domain and API guidance](domain-and-api.md).

Remote migrations require the explicit authorization stated in the root AGENTS.md.
