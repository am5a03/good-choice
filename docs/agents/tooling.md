# Tooling

Read for local setup, dependency changes, or generated files.

- Use Node 22, at least 22.12.0, matching [the runtime selection](../../.nvmrc) and [the engine requirement](../../package.json).
- Install with `npm ci` and the committed `package-lock.json`. Do not delete the lockfile or use `--force` or `--legacy-peer-deps` to bypass dependency conflicts.
- Before changing dependencies, read [dependency maintenance](../dependencies.md) for the Drizzle Kit pin, npm override, and audit requirements.
- Never commit local D1 files, `node_modules/`, or generated deployment output; local state and build output belong in ignored paths such as `.wrangler/` and `dist/`.

Local startup instructions are in [README](../../README.md#run-locally).
