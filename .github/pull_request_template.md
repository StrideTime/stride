<!-- Keep this short. The checklist exists to catch the two things that silently break later. -->

## What & why



## Checklist

- [ ] **Drift rule:** changes to product scope, data model, screens, architecture, or the plan
      update the matching doc in `docs/` (or an ADR in `.cursor/rules/decisions.mdc`) **in this PR**.
- [ ] **Migrations committed:** if the Drizzle schema changed, `pnpm db:generate` was run and the
      new file in `packages/db/migrations/` is included. (CI fails otherwise.)
- [ ] **Expand/contract:** any destructive migration (DROP / type change / NOT NULL) is safe
      against the currently-running version and carries a `-- @safety:reviewed <reason>` marker.
- [ ] **Hotfix only — merged back to main:** if this fix was branched off the production release
      tag, it is also being merged back into `main` so it isn't lost in the next release.
