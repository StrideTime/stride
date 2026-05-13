# Stride — agent entry point

**Start with [`docs/INDEX.md`](docs/INDEX.md).** It is the map of content for everything that isn't a coding convention: what Stride is, the data model, the screens, the plan, and reference material. Read it before searching the repo — it routes you to the one file you need.

## Coding conventions & architecture: `.cursor/rules/*.mdc`

Conventions are **not** duplicated into this file or the `docs/` vault. `.cursor/rules/*.mdc` is the single source of truth (decision 2026-03-19). Cursor auto-attaches the relevant ones by glob; in Claude Code, read them directly:

| File | When | Always-on? |
|---|---|---|
| `architecture.mdc` | monorepo layout, dependency rules, build targets, offline queue, data model | yes |
| `code-style.mdc` | formatting, naming, `type` vs `interface`, imports | yes |
| `decisions.mdc` | append-only ADR log — check for recent decisions before any non-trivial work | yes |
| `workflow.mdc` | how to approach tasks, Jira ingestion, scope discipline | yes |
| `git.mdc` | branch names, commit format, build verification | yes |
| `ticket-conventions.mdc` | Jira epic/story naming | yes |
| `ui-components.mdc` | `packages/ui` + `apps/web` components — Base UI, CSS Modules, Phosphor, atomic design | when touching UI |
| `react-patterns.mdc` | `apps/web` — TanStack Start routes, TanStack Query/Form | when touching `apps/web` |
| `service-patterns.mdc` | `apps/api` service classes | when touching services |
| `db-patterns.mdc` | Drizzle schema + repos, soft delete, idempotency | when touching `packages/db` or `apps/api` |
| `testing.mdc` | Vitest conventions | when writing tests |
| `ticket-design.mdc` | Jira design-ticket conventions | when creating Jira tickets |

## The drift rule

A change that affects product scope, the data model, the screens, the architecture, or the plan updates the matching doc in `docs/` **in the same change**. A new architectural decision gets an entry appended to `.cursor/rules/decisions.mdc`. Don't let docs and code drift.
