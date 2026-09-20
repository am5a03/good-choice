# GoodChoice

A grocery decision companion: compare what is in front of you, understand the meaningful differences, and decide whether switching is worthwhile.

This is the original functional prototype migrated to **React + TypeScript + shadcn/ui**, a **Cloudflare Worker**, and **D1 through Drizzle ORM**. It is a modular application, not the old HTML embedded in an iframe.

## Run locally

Use Node 22.12 or newer (the project is tested with Node 22).

```sh
npm ci
npm run db:setup
npm run dev
```

Open the Vite URL, usually `http://localhost:5173`. Cloudflare's Vite plugin runs the API in the Workers runtime and shares the same origin as the frontend. No account, API key or Cloudflare login is required for local D1 development.

## What is included

- Browse/search a paginated, database-backed cereal catalog and resolve demo barcodes.
- Compare two to four products by fibre, total sugars, sodium or unit price.
- Normalize quantities to 100 g or a custom bowl; edit local package prices and weights.
- Explicit tie, missing-data and insufficient-selection states.
- Ingredient explanations and source links, product provenance and allergen-statement limitations.
- Local bookmarks, usual products, saved comparisons, manual labels and photo previews.
- Versioned local storage; import/export including the original prototype's version 1 export format.
- Accessible shadcn-style components built on Radix primitives, responsive layouts and keyboard-dismissible dialogs.
- Generated SQL migrations, Drizzle snapshots and journal; repeatable demo seeding and schema-drift checks.
- Type checks, unit/API tests, real local-D1 browser tests and a manual deployment workflow.

**The eight seed products, illustrations, quantities and prices are fictional.** Barcode lookup recognizes `DEMO001`–`DEMO008`; there is no external barcode database, camera scanner, OCR, AI analysis or live retailer pricing. Photos are only local reference previews, never uploaded or saved.

## Architecture

```text
src/app/                    application shell and routes
src/components/ui/          owned shadcn/ui components
src/features/catalog/       browsing, API queries, labels and lookup
src/features/comparison/    comparison presentation
src/features/shelf/         private local state, migration and import/export
src/features/guide/         ingredient explanations
shared/                     Zod contracts and pure comparison/shelf logic
server/app.ts               Hono HTTP API; validation and error boundaries
server/catalog/             Drizzle-backed catalog repository
server/db/schema.ts         relational database source of truth
db/migrations/              generated SQL + meta snapshots + journal
db/seed/                    fictional starter fixtures (not production migrations)
scripts/                    seeding, schema checks, remote-operation guards
tests/                      unit, API and desktop/mobile browser tests
```

The public API is deliberately **read-only**. Personal shelves and user-entered changes remain browser-local, matching the prototype. There is no shared unauthenticated write endpoint and no invented authentication system. Accounts and server-side personal-data sync require a separate, explicit design decision. See [architecture](docs/architecture.md).

## Database workflow

```sh
# After editing server/db/schema.ts:
npm run db:generate -- --name=describe_the_change
# Review SQL, then commit SQL AND the meta snapshot/journal together.
npm run db:check
npm run db:migrate:local
```

Drizzle Kit generates migrations without database credentials. **Wrangler alone applies them**, using its `d1_migrations` ledger. Do not combine this with `drizzle-kit push` or another migration runner. Applied SQL is immutable: make a new migration instead. The fixtures are separate from schema migrations, idempotent and do not overwrite existing records.

## Checks

```sh
npm run check
npm run db:setup
npx playwright install chromium
npm run test:e2e
```

CI also repeats database setup to check idempotency, then runs browser tests against an actual local D1 database on desktop and mobile. Artifacts include the Playwright report, screenshots/traces and a source ZIP. CI requires no Cloudflare secrets.

## Deploy

`wrangler.jsonc` contains a **placeholder D1 ID** for local development. Remote commands refuse to proceed until it is replaced. See [deployment instructions](docs/deployment.md). Nothing is deployed automatically by this initial migration.

## Add frontend components

```sh
npm run ui:add -- skeleton
```

`components.json`, Tailwind v4 theme tokens and aliases are configured. Keep reusable primitives in `src/components/ui` and product behavior in feature modules. The adapted shadcn components retain their MIT notice in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

## Move an existing prototype shelf

Export JSON from the original HTML prototype, then open **Settings → Import a shelf** in this app. Review the confirmation before replacing local data. A downloaded HTML file and a hosted app do not share a storage origin; the app cannot automatically read the HTML file's local storage.
