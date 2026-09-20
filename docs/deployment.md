# Cloudflare setup and deployment

## Local development

```sh
npm ci
npm run db:setup
npm run dev
```

Local D1 state lives under `.wrangler/` and is ignored by Git. Cloudflare credentials are unnecessary for these commands. If you change the database ID later, run `npm run db:setup` again for the resulting local binding.

## Create your remote D1 database

```sh
npx wrangler login
npx wrangler d1 create good-choice-db
```

Copy the returned database ID into `wrangler.jsonc`, replacing `00000000-0000-0000-0000-000000000000`. A database ID is configuration, not an API token; API tokens must never be committed or placed in `VITE_*` variables.

Review and apply schema migrations, then deploy:

```sh
npm run check
npm run db:migrate:remote
npm run deploy
```

A fresh production database has no product records. To deliberately populate a **demo deployment** with the eight fictional cereals:

```sh
npm run db:seed:remote -- --confirm-demo
```

This confirmation is required because the fixtures are not real grocery data. The seeder inserts missing fixture IDs without overwriting existing records. Do not use it as a production product-ingestion process.

## GitHub Actions deployment

The provided workflow is manual and restricted to `main`. First merge the application and configure the real D1 ID. Set repository or `production` environment secrets:

- `CLOUDFLARE_API_TOKEN`: a narrowly scoped token for the intended account, with Workers Scripts edit and D1 edit permissions (and any permissions required for custom routes you separately configure).
- `CLOUDFLARE_ACCOUNT_ID`: the target Cloudflare account.

Then run **Deploy to Cloudflare (manual)** from GitHub Actions on `main`. It installs the locked dependencies, runs checks, applies remote migrations and deploys the built Worker/assets. It never seeds production automatically. Use environment approvals for the production job as appropriate.

No Cloudflare resources were created or deployed as part of preparing this repository.

## Verification and troubleshooting

- `/api/health` should return JSON with `database: "reachable"`.
- `/api/products?limit=2` should return a bounded catalog page.
- `/api/does-not-exist` should return a JSON 404, not `index.html`.
- `/compare`, `/shop`, `/shelf` and `/guide` should load directly, not just through in-app navigation.
- A catalog-unavailable screen usually means local/remote migrations have not been applied to the active binding. An empty catalog means fixtures or genuine product data have not been imported.
- The D1 ID guard deliberately blocks remote commands while the placeholder is present.

Official references: [Cloudflare Vite plugin](https://developers.cloudflare.com/workers/vite-plugin/), [Worker static assets](https://developers.cloudflare.com/workers/static-assets/), [D1 migrations](https://developers.cloudflare.com/d1/reference/migrations/), [Drizzle D1](https://orm.drizzle.team/docs/connect-cloudflare-d1), [shadcn Vite setup](https://ui.shadcn.com/docs/installation/vite).
