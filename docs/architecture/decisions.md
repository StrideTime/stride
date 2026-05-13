---
title: Architecture decisions (ADR log)
updated: 2026-05-12
status: current
owner: jaren
---

# Architecture decisions

**The ADR log lives at [`.cursor/rules/decisions.mdc`](../../.cursor/rules/decisions.mdc).** It is append-only — never edit or delete a past entry; supersede with a new dated one. Cursor auto-loads it; Claude Code should read it before any non-trivial work. This file is just a pointer plus a contents list so the log is discoverable from the vault.

## Entries recorded so far

- **2026-03-19 — Styling stack: Base UI + CSS Modules.** No Tailwind, no shadcn/ui, no CSS-in-JS. CSS Module files `ComponentName.module.css`, co-located. Inline styles only for dynamic computed values.
- **2026-03-19 — `DES::` epic prefix** for Design work (distinct from `DE::` = Desktop/Tauri). Full prefix set: BE, FE, DE, DES, INF.
- **2026-03-19 — `.cursor/rules/` is the single convention source** — shared by Cursor and Claude Code; `CLAUDE.md` is a pointer, conventions are never duplicated.
- **2026-05-04 — Full stack definition** — CF-native, TanStack Start, server-authoritative offline. Locks the stack table, the build-target split, the Tauri two-window architecture, the offline mutation queue, source integration, and the core data model. Lists what's *explicitly rejected* (PowerSync, Supabase, TanStack DB in production now, ElectricSQL, separate Tauri React app, separate tray binary, Stride-native Specs, Sessions tied directly to Specs) — do not reintroduce any of those without a new entry.

## Adding a decision

When you make a non-obvious architectural/dependency choice during implementation, **say so** so it can be recorded — but don't edit `decisions.mdc` yourself during normal work. Append only when explicitly asked. Format (from the file's own header):

```
## YYYY-MM-DD: Short title
Context and reasoning. Reference the Jira ticket if applicable.
```

## What goes here vs. elsewhere

- **Tech / architecture / dependency decisions** → `.cursor/rules/decisions.mdc`.
- **Product / scope decisions** → recorded in `docs/product/` (e.g. `mvp.md`) and removed from `docs/product/open-questions.md` with a changelog line. Not in the ADR log unless they have an architectural consequence.
- **Convention changes** (style, patterns) → edit the relevant `.cursor/rules/*.mdc` directly; note the change in `decisions.mdc` if it's significant.
