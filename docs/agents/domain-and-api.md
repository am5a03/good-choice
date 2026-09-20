# Domain logic and API boundaries

Read when changing comparisons, ingredient information, API contracts, data ingestion, or personal-data ownership.

Before changing module or API boundaries, read [README](../../README.md#architecture) and [architecture and boundaries](../architecture.md).

## Comparisons and product information

- Keep numerical comparison logic deterministic in `shared/comparison.ts`.
- Represent unknown values as `null`, never zero.
- Do not infer ingredients or added-sugar amounts from incomplete product data.
- Do not introduce universal safety scores or allergy-safe claims.
- Keep real product ingestion separate from fictional seed fixtures.

## Contracts and ownership

- Keep API contracts in `shared/models.ts`.
- UI modules must not import server database code or credentials.
- Keep the public catalog API read-only; do not expose unauthenticated writes.
- Personal shelves remain browser-local. Cloud synchronization requires an explicit authentication and ownership design, not a public shared-state endpoint.

For schema or fixture changes, also read [database guidance](database.md).
