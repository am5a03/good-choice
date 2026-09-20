# Working on GoodChoice

Read README.md and docs/architecture.md before changing boundaries.

- Use Node 22 and npm with the committed lockfile. Do not use --force or --legacy-peer-deps to hide dependency conflicts.
- Keep numerical comparisons deterministic in shared/comparison.ts. Unknown is null, not zero; do not infer ingredients or added-sugar amounts. No universal safety scores or allergy-safe claims.
- Keep API contracts in shared/models.ts. UI modules must not import server database code or credentials.
- Use existing shadcn components and theme tokens. Add primitives via the configured CLI, then review changes.
- Change server/db/schema.ts first; generate and commit SQL, snapshots and journal together. Do not rewrite applied migrations or introduce drizzle-kit push as a second schema-management path.
- Keep real ingestion separate from fictional seed fixtures. Never silently seed production or expose unauthenticated writes.
- Run npm run check, npm run db:setup and npm run test:e2e. Review desktop/mobile screenshots and any failures honestly.
- Personal shelves are local by design. Cloud synchronization requires an explicit authentication and ownership design, not a public shared state endpoint.
- Never commit .dev.vars, API tokens, local D1 files, node_modules or generated deployment output. Never place secrets in VITE_* variables.
- Remote migrations, resource creation and deployment require explicit authorization. Do not deploy as a side effect of editing code.
