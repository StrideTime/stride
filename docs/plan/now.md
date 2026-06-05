---
title: Now
updated: 2026-06-04
status: current
owner: jaren
---

# Now

What's actively in flight. Keep this short; update it often. The bigger picture is [`roadmap.md`](roadmap.md).

## In progress

- **Backend foundation kickoff.** Platform decision closed (Cloudflare + Neon; Convex declined).
  `@stride/db` now holds the v1 Drizzle schema + drizzle-zod types, workspace-owned tables have
  Drizzle-defined RLS policies, and the environment wiring is mostly provisioned. FE prototype
  iteration with `$impeccable` + mocked data continues in parallel.

## Current handoff for agents

Start from `docs/INDEX.md`, then read `.cursor/rules/decisions.mdc`, `.cursor/rules/db-patterns.mdc`,
and `docs/product/data-model.md` before changing schema or API code.

What is already decided and should be honored:

- Stride is user-owned execution software, not employee surveillance. Do not add feature defaults
  that rank, compare, or monitor individuals.
- Specs are source-owned; there are no Stride-native Specs. Standalone work is an Action.
- Actions are Stride-owned execution steps. They have a Stride-owned `difficulty`; they do not have
  source-mapped status, source priority, comments, or assignees.
- Sessions attach to Actions, never directly to Specs. Session notes live in `session_notes`, not
  serialized JSON on `sessions`.
- Scheduled event types are workspace preferences seeded with defaults. Users may add/rename/reorder/
  recolor/archive non-system types. External calendar events are source-owned and not editable as
  Stride categories.
- Source status, priority, and difficulty are mapped through Team Source mapping. Mapped values own
  display mode, text/icon, color token, and status category where applicable. Mapping changes apply
  retroactively because Specs store the mapped key and rendering resolves metadata centrally.
- `source_units` are first-class sync targets: Jira board, Linear team, or GitHub repository. A Team
  has one primary source mapping in v1; each source unit maps to one Team per Workspace.
- Spec grouping from epics/initiatives/milestones/projects lives in structured `labels[]`.
  `sourceCycle` is only sprint/cycle.
- Working hours are per-workspace personal membership settings and should support multiple
  non-overlapping windows per day.
- Workspace roles and Team roles are separate `member | admin` scopes. Do not recreate a combined
  role ladder.
- Workspace and Team settings are explicit typed schema columns matching the admin settings surfaces,
  not generic JSON records.
- Postgres RLS is a database backstop. API services must still validate product permissions.

Known next implementation requirements:

- Add the API transaction helper that validates the current user has a workspace Membership, then
  sets `app.workspace_id` for the transaction before querying RLS-protected tables.
- Decide whether to also set `app.user_id` now for future user-scoped policies; current RLS only
  isolates workspace-owned data.
- Re-platform `apps/api` from the node-server stub to the Cloudflare Worker/Hono target and connect
  it to Neon through Hyperdrive.
- Build repositories/services against `@stride/db` using `db-patterns.mdc`; include soft-delete
  filters and service-level checks for workspace admin vs team admin.
- Reconcile FE mock shapes to canonical drizzle-zod types before wiring real queries.
- Continue source-sync research/build from the Jira spike worktree and apply the same source unit /
  mapping model to Linear and GitHub.
- Calendar sync, capture/learning, offline mutation queue, Insights, comments, and LLM behavior
  remain post-MVP unless a later decision says otherwise.

## Next up

1. **RLS runtime helper + API platform.** Build the workspace-scoped transaction wrapper, then
   re-platform `apps/api` to Hono on Cloudflare Workers with Neon + Hyperdrive.
2. **Repository/service layer.** Add DB access per `db-patterns.mdc`, starting with User,
   Workspace/Membership, Team/TeamMember, Session/Action, and SourceConnection/SourceUnit.
3. **Reconcile the FE types to `@stride/db`.** Make the prototype's `BacklogSpec`/`BacklogAction`/
   `Session` shapes match canonical drizzle-zod types; give Actions real UUIDs; add a query-hook
   seam so screens stop importing `.mock.ts` directly.
4. **Vertical slices trailing the FE.** Session → Spec/Actions → Schedule → Today/Tray → My data →
   one-way Jira sync.

## Recent

- 2026-06-04 — Implemented Drizzle-defined RLS policies for workspace-owned tables, added
  `team_members.workspace_id`, generated migration `0009`, and documented that services must set
  workspace session context inside validated transactions.
- 2026-06-04 — Reworked schema decisions after review: source units, source mappings for
  status/priority/difficulty, typed Workspace/Team settings, separate Workspace/Team roles,
  session notes table, RRULE recurrence, curated color/icon tokens, and post-MVP cuts for capture,
  concept links, and offline mutation processing.
- 2026-06-02 — Built **`packages/db`** (`@stride/db`): v1 schema (10 tables), drizzle-zod types, migration `0000` generated; typecheck green. Locked the Cloudflare platform decision + Q4/Q8/Q11/Q21 (see `decisions.mdc` 2026-06-02).
- 2026-05-13 — Parked the incomplete generic task API. `apps/api` is a Hono stub while the FE prototype defines the backend shape.
- 2026-05-12 — Created the `docs/` vault and `stride/CLAUDE.md`; migrated `PRODUCT.md` in from `claude-design-files/`; wrote the product spec; inventoried superseded material.
