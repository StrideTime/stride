---
title: How this vault works
updated: 2026-05-12
status: current
owner: jaren
---

# How this vault works

`stride/docs/` is the documentation vault for **product, plan, and reference**. It is git-tracked, lives inside the monorepo next to the code, and is a valid [Obsidian](https://obsidian.md) vault (open the `docs/` folder in Obsidian for backlinks and graph; add the Local REST API plugin + its MCP if you want agent-query ergonomics).

## What lives where

| Topic | Home | Why |
|---|---|---|
| Coding conventions, code patterns, file structure | `.cursor/rules/*.mdc` | Single source of truth (decision 2026-03-19). Cursor auto-loads by glob; Claude Code reads directly. **Not duplicated here.** |
| Architecture decisions (the ADR log) | `.cursor/rules/decisions.mdc` | Append-only. Never edit past entries. The locked stack is the 2026-05-04 entry. |
| What Stride is, the data model, the screens | `docs/product/` | Product spec — readable in minutes, not reverse-engineered from a prototype. |
| The plan / roadmap / what's in flight | `docs/plan/` | Replaces the deleted `.agents/STRIDE_MASTER_PLAN.md`. |
| Pointers to prototypes and archived material | `docs/reference/` | So nothing is silently abandoned or rediscovered the hard way. |
| Strategy / brand / principles | `docs/PRODUCT.md` | Owned by the `impeccable` tooling — kept in the shape that tool expects. |
| Visual design system (tokens, type, color, motion) | `docs/DESIGN.md` | Owned by `impeccable`; generated/refined via `$impeccable document`. |
| The entry point that ties it all together | `docs/INDEX.md` + `stride/CLAUDE.md` | Agents read `CLAUDE.md` (auto-loaded), which points at `INDEX.md`, which routes everywhere. |

## File conventions

- **One topic per file.** Small, atomic notes — surgical to update, cheap to load. If a file is growing two subjects, split it.
- **Frontmatter on every vault-native file:**
  ```yaml
  ---
  title: <short human title>
  updated: <YYYY-MM-DD>           # bump on every meaningful edit
  status: current | draft | stub | superseded
  owner: <who maintains it>
  ---
  ```
  Exceptions: `PRODUCT.md` and `DESIGN.md` are owned by the `impeccable` tooling and stay in that tool's expected shape (no frontmatter).
- **Status lifecycle:** `stub` (placeholder, needs writing) → `draft` (written, not confirmed) → `current` (confirmed, authoritative). `superseded` = kept for history only; say what replaced it and link to it.
- **Links:** use Obsidian wikilinks `[[note-name]]` or relative markdown links. Linking to a note that doesn't exist yet is fine — it marks something worth writing.

## The drift rule

A change to code or conventions that affects **product scope, the data model, the screens, the architecture, or the plan** updates the matching doc here **in the same PR**. A new architectural decision gets an entry appended to `.cursor/rules/decisions.mdc`. Review catches drift; that only works if the doc change rides along with the code change. (Can be backed by a PR-template checklist or a `Stop` hook later — not yet enforced mechanically.)

## Adding a note

1. Pick the right folder (`product/`, `architecture/`, `plan/`, `reference/`, `_meta/`).
2. Create `kebab-case-name.md` with the frontmatter block above.
3. Add a one-line entry to `INDEX.md` under the right section.
4. Link it from any related note.
