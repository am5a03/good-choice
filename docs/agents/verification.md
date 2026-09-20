# Verification before handoff

Run the existing verification sequence:

```sh
npm run check
npm run db:setup
npm run test:e2e
```

When Chromium is not installed, run `npx playwright install chromium` before the browser tests.

- `npm run check` does not run browser tests or set up local D1; do not treat it as a substitute for the remaining commands.
- Run the configured desktop and mobile Playwright projects against local D1.
- Review desktop and mobile screenshots, including relevant layout, clipping, and dialog behavior for changed UI.
- Report commands actually run, their results, and any failures or checks that could not be completed.

The [CI workflow](../../.github/workflows/ci.yml) also repeats `npm run db:setup` to verify migration and fixture idempotency.
