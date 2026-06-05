---
title: Now
updated: 2026-06-02
status: current
owner: jaren
---

# Now

What's actively in flight. Keep this short; update it often. The bigger picture is [`roadmap.md`](roadmap.md).

## In progress

- **Backend foundation kickoff.** Platform decision closed (Cloudflare + Neon; Convex declined) and the schema-shaping open questions resolved (Q4/Q8/Q11/Q21). `@stride/db` now holds the v1 Drizzle schema + drizzle-zod types. FE prototype iteration with `$impeccable` + mocked data continues in parallel.

## Next up

1. **Reconcile the FE types to `@stride/db`** — make the prototype's `BacklogSpec`/`BacklogAction`/`Session` shapes match the canonical drizzle-zod types (kills the `elapsedMin` vs `durationMin` / priority-scale / bare-string-assignee divergences); give Actions real UUIDs; add a query-hook seam so screens stop importing `.mock.ts` directly.
2. **Re-platform `apps/api`** from the `@hono/node-server` stub to Hono on CF Workers against `@stride/db`; add the DB connection (Neon + Hyperdrive) and the repository layer per `db-patterns.mdc`.
3. **Better Auth + RLS + Hyperdrive** plumbing, then build vertically trailing the FE one screen (Session → Spec/Actions → Schedule → Today/Tray → my-data + one-way Jira sync).

## Recent

- 2026-06-02 — Built **`packages/db`** (`@stride/db`): v1 schema (10 tables), drizzle-zod types, migration `0000` generated; typecheck green. Locked the Cloudflare platform decision + Q4/Q8/Q11/Q21 (see `decisions.mdc` 2026-06-02).
- 2026-05-13 — Parked the incomplete generic task API. `apps/api` is a Hono stub while the FE prototype defines the backend shape.
- 2026-05-12 — Created the `docs/` vault and `stride/CLAUDE.md`; migrated `PRODUCT.md` in from `claude-design-files/`; wrote the product spec; inventoried superseded material.
