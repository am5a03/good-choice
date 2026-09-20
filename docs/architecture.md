# Architecture and boundaries

## A modular monolith, not a microservice fleet

One repository, one TypeScript toolchain and one Worker deployment. Vite builds the React SPA and Worker together. `/api` and `/api/*` always reach Hono before SPA asset handling, including unknown endpoints. Other deep links are served by the SPA fallback. Frontend requests use relative URLs; no development CORS workaround or browser API key is needed.

TanStack Query owns server state (bounded, paginated catalog reads and product-detail queries). A versioned local shelf store owns personal state. Shared Zod contracts validate API payloads, manual entries, seed data and imported exports. The database is behind a repository boundary so future import providers do not become UI dependencies.

## Data model

- `products`: identity, Canadian market, barcode, category, display artwork and ingredient transcription. Nullable allergen statements and ingredient lists preserve missing information.
- `nutrition`: one row per product, nullable values normalized to **100 g as sold**, with a source and verification timestamp. Database checks constrain ranges and nutrient subsets.
- `price_observations`: appendable, timestamped CAD package-price observations. Integer cents and a positive package mass determine unit price. An indexed query chooses the newest CAD observation, with an ID tie-breaker.

Foreign keys cascade on product deletion. Market/barcode uniqueness prevents duplicate variants within the same market. The pilot supports packaged cereals by mass only: it does not convert millilitres into grams or dry into prepared foods. Category expansion must introduce explicit comparable quantities, not silently reuse this assumption.

Sources and verification timestamps are separate for product/ingredient records, nutrition and prices. A fixture timestamp is not verification. UI provenance uses explicit labels; there is no fabricated confidence percentage.

## Decision engine

`shared/comparison.ts` is pure and deterministic. It compares unrounded quantities, deduplicates selections, distinguishes a tie from missing information, and returns no winner when any selected product lacks the chosen metric. Unit prices use equal mass. Missing values are `null`, never zero. Other incomplete nutrients can remain unknown while an available selected metric is compared. The explanation is a priority match, not an overall health or safety score.

## Personal data and security

The catalog is public and read-only. `POST`, `PUT`, `PATCH` and `DELETE` are rejected. No accounts, sessions or public write API are supplied just to make the scaffold appear more complete. Local edits overlay API results without modifying other shoppers' catalog data. Personal settings are not transmitted to a server. Uploaded label previews use revocable object URLs and are neither persisted nor sent over the network.

Before adding cloud-synced shelves: select an authentication provider, add server-side ownership checks for every personal record, define deletion/export behavior and protect writes against cross-site requests. Do not use a static frontend API key as multi-user authentication. Before opening catalog writes: add trusted ingestion, moderation, provenance validation and quotas.

## Persistence and growth

The browser catalog paginates in batches of 24. The API enforces a maximum of 60 per page. Selected/saved product IDs are fetched independently, so comparison does not require downloading the whole database. API errors show explicit retry/setup states, rather than silently using a different dataset.

Current limitations: personal records are single-browser only; catalog search uses bounded SQLite `LIKE` queries (not FTS); no live retailer feeds, image storage or external ingredient provider. D1 schema is a deliberate small foundation, not a claim of unlimited traffic capacity. Introduce FTS, measured caching, authenticated ingestion and object storage when those features are actually required.

## Migrations

The pinned Drizzle Kit version generates SQL, `meta/0000_snapshot.json` and `meta/_journal.json`; all are committed. Wrangler uses the same `db/migrations` directory locally and remotely. `npm run db:check` copies the migration history to a temporary directory and asks Drizzle to generate again; any new SQL means the schema has drifted from the committed snapshots. CI applies the SQL and seeds twice in local D1 and queries it through the Worker.

Do not edit already applied SQL, create a parallel Drizzle runtime ledger, silently push schema changes, or locate a random `.wrangler` SQLite file for configuration. Seed data is not a schema migration and is opt-in on a remote database.
