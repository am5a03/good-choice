# GoodChoice

GoodChoice helps shoppers compare groceries, understand ingredients, and decide whether switching products is worthwhile.

- Never commit `.dev.vars` or API tokens, or expose secrets through `VITE_*`.
- Remote migrations, resource creation, and deployment require explicit authorization.

`npm run check` runs typechecks, tests, migration-drift checks, and the build.
`npm run typecheck` checks all three TypeScript projects.

Read relevant guides before editing; follow [verification](docs/agents/verification.md) before handoff.

- [Tooling](docs/agents/tooling.md): setup, dependencies, generated files.
- [Domain and API](docs/agents/domain-and-api.md): comparisons, ingredients, contracts, data ownership.
- [Frontend](docs/agents/frontend.md): components and styling.
- [Database](docs/agents/database.md): schema, migrations, seeds.
- [Deployment](docs/deployment.md): authorized remote operations.
