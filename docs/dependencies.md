# Dependency maintenance

The committed lockfile is part of the application. CI installs it with `npm ci`, records an audit report, and fails on reported moderate-or-higher advisories. Reports are uploaded with browser-test artifacts, including when a check fails.

The migration uses Drizzle ORM 0.45.2 and Vitest 4.1.11 following their published security fixes:

- https://github.com/drizzle-team/drizzle-orm/security/advisories/GHSA-gpj5-g38j-94v9
- https://github.com/vitest-dev/vitest/security/advisories/GHSA-82fw-gwwq-j7x9

Drizzle Kit is pinned to 0.31.4 to preserve the generated flat SQL/snapshot/journal format. Its transitive `@esbuild-kit/core-utils` loader requests an older esbuild. The targeted npm override uses patched esbuild 0.25.x for that loader. Schema generation and drift checks exercise the loader in CI; do not remove the override without rechecking the audit and generation workflow.

Advisory: https://github.com/evanw/esbuild/security/advisories/GHSA-67mh-4wv8-2f99

The dependency refresh was resolved using npm 11 because npm 10's resolver crashed while changing optional-peer dependency trees. Normal setup uses the committed lockfile with `npm ci`; do not delete it or use `--force`/`--legacy-peer-deps`. For future dependency updates, use an up-to-date npm version compatible with Node 22, review the lockfile diff, and rerun the full checks.

An audit is not proof that the application is secure. Keep runtime and development tools updated, review incoming advisories, and never expose a development server to an untrusted network. The repository has no permanent workflow that writes dependency changes to a branch automatically.
