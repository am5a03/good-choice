# Dependency maintenance

The committed lockfile is part of the application. CI records a dependency-audit report alongside the browser-test artifacts.

The initial migration updates Drizzle ORM to 0.45.2 and Vitest to 4.1.11 following their published security fixes:

- https://github.com/drizzle-team/drizzle-orm/security/advisories/GHSA-gpj5-g38j-94v9
- https://github.com/vitest-dev/vitest/security/advisories/GHSA-82fw-gwwq-j7x9

Drizzle Kit is pinned to 0.31.4 to preserve the generated flat SQL/snapshot/journal format. Its transitive `@esbuild-kit/core-utils` loader requests an older esbuild. The targeted npm override uses patched esbuild 0.25.x for that loader. Schema generation and drift checks exercise the loader in CI; do not remove the override without rechecking the dependency audit and generation workflow.

Advisory: https://github.com/evanw/esbuild/security/advisories/GHSA-67mh-4wv8-2f99

This is not a claim that an audit proves the application secure. Keep runtime and development tools updated, review incoming advisories, and never expose a development server to an untrusted network.
