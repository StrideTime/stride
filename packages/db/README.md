# @stride/db

Drizzle schema + drizzle-zod inferred types for Stride. **Schema definitions and validation
schemas only — no business logic.** Imported by `apps/api` (repositories, services). Never
imported by `apps/web` directly (the web app types against `@stride/api-client`).

Conventions live in [`.cursor/rules/db-patterns.mdc`](../../.cursor/rules/db-patterns.mdc); the
conceptual model lives in [`docs/product/data-model.md`](../../docs/product/data-model.md). When
this schema and that doc disagree, **the schema is reality and the doc is the bug**.

## Layout

```
src/
  enums/      as-const union enums (SourceType, MembershipRole, SpecStatus, Feeling, …)
  schema/     one Drizzle table per file + its drizzle-zod insert/select schemas + inferred types
  index.ts    barrel — re-exports schema + enums
```

`@stride/db` re-exports everything; `@stride/db/schema` exposes the `*Table` objects for repos.

## v1 tables

Identity & tenancy: `users`, `workspaces`, `memberships`, `teams`, `teamMembers`.
Sources: `sourceConnections` (pooled creds + available units), `teamSourceMappings` (unit→team
binding + status/priority/difficulty maps). Work: `specs`, `specLinks`, `specActivity`,
`actions`, `sessions`, `captures`. Schedule: `scheduledEvents` (the plan layer; the actual
layer is `sessions`). Surfaces: `notifications` (inbox). Infra: `processedMutations`,
`conceptLinks` (the empty cross-cutting junction).

Every domain table carries `id` (client-generated UUID `text`), `createdAt`, `updatedAt`, and
`deleted` (operational soft delete). Excluded from soft delete per `db-patterns.mdc`:
`processedMutations` and `conceptLinks` (pure infra/junction), and `specActivity` (an
append-only audit log — it also has no `updatedAt`).

### Derived, never stored

The query/API layer computes these from the primitives above — they are deliberately absent
from the schema: a Spec's `readiness` and the backlog view tabs; the `attention` flags
(`unassigned`, `closed-in-source`, `just-landed` — the last derived from `specs.assignedAt`);
an Action's `scheduled` state and future-scheduled minutes; `recommendationReason`; a Spec's
display `type`; and the reconstructable parts of the Spec history timeline.

## Commitments baked into the schema (see `decisions.mdc` 2026-05-21 / 2026-06-02)

- **Source-native storage** — source-specific grouping/fields live in `jsonb` columns
  (`specs.sourceGrouping`, `specs.sourceData`); there is no unified Project/Sprint entity.
- **Derived backlog state** — `readiness` and the backlog view tabs are computed in the query
  layer, never stored. The schema holds primitives + internal `specs.status` (`open|closed`).
- **Provenance-ready Sessions** — `sessions.contentSignal` + `signalSource` ship nullable and
  unused in v1, so git/file correlation lands later with no migration.
- **Privacy default off** — `memberships.presenceEnabled` defaults `false` (opt-in only).
- **Cross-cutting attachment point** — `conceptLinks` ships empty and unsurfaced.

> Note: tenant isolation (Postgres RLS), the typed API surface, asymmetric-access aggregation,
> and honest (hard) deletion of user data are enforced in `apps/api` / the DB session layer,
> not expressible in the table definitions here.
