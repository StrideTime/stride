# Stride — agent entry point

**Start with [`docs/INDEX.md`](docs/INDEX.md).** It is the map of content for everything that isn't a coding convention: what Stride is, the data model, the screens, the plan, and reference material. Read it before searching the repo — it routes you to the one file you need.

## What Stride is for — read before designing anything

Stride exists to give a person **momentum and a clear view of their own growth**. It captures signal to serve the person who produced it; it surfaces patterns to a team only in aggregate. It is **never** a tool for ranking, comparing, or monitoring individuals — that would corrupt the very data the product depends on (trust → honest input → accurate data → product value).

**The test for any feature, default, schema field, or line of copy:** *does this make the user more certain the data is theirs, or less?* Less = don't ship it.

The full reasoning and the enforced commitments are in [`docs/product/principles.md`](docs/product/principles.md). Read it before designing or changing any surface.

## Coding conventions & architecture: `.cursor/rules/*.mdc`

Conventions are **not** duplicated into this file or the `docs/` vault. `.cursor/rules/*.mdc` is the single source of truth (decision 2026-03-19). Cursor auto-attaches the relevant ones by glob; in Codex, read them directly:

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

## Agent skills

### Issue tracker

Issues and PRDs are tracked in Linear using the Linear CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Agent triage uses five Linear labels: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, and `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context repo: use the existing docs vault starting at `docs/INDEX.md`, with decisions in `.cursor/rules/decisions.mdc`. See `docs/agents/domain.md`.
