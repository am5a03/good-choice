# Frontend components and styling

Read when changing UI components, styling, or frontend integration.

- Reuse existing shadcn components and theme tokens.
- Keep reusable primitives in `src/components/ui/` and product behavior in feature modules.
- Add primitives through the configured CLI, for example:

  ```sh
  npm run ui:add -- skeleton
  ```

- Review the generated diff for overwritten components, import aliases, theme integration, and dependency or lockfile changes.
- For API integration or personal-state changes, also read [domain and API guidance](domain-and-api.md).

CLI paths and aliases are configured in [components.json](../../components.json).
Screenshot review is covered by [verification](verification.md).
