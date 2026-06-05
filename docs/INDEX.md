---
title: Stride docs — index
updated: 2026-05-12
status: current
owner: jaren
---

# Stride documentation

The source of truth for **product, plan, and reference**. Coding conventions and architecture decisions live in [`.cursor/rules/*.mdc`](../.cursor/rules) — this vault points at them, never duplicates them.

Read this page first. It routes you to the one file you need; don't grep the repo blindly.

## Product — what Stride is and does

- [`product/overview.md`](product/overview.md) — what Stride is, the conceptual model, the long-term vision, user modes, who it's for, platforms. **Start here.**
- [`product/principles.md`](product/principles.md) — the non-negotiable commitments: the purpose, the "is the data theirs?" test, privacy as a data-integrity requirement. **Read before designing any surface.**
- [`product/glossary.md`](product/glossary.md) — spec, action, session, break down, workspace, team, source, roles. The vocabulary, pinned.
- [`product/surfaces.md`](product/surfaces.md) — the screens: Today (two mode variants), Backlog, Schedule (single day view), Tray, Spec view. What each does, key elements, states. (Insights is deferred from v1.)
- [`product/backlog.md`](product/backlog.md) — Backlog-specific product and design brief for production implementation and `$impeccable live` iteration.
- [`product/data-model.md`](product/data-model.md) — Spec → Action → Session, standalone Actions, the source-mapping table. Conceptual model (the DB schema lives in code).
- [`product/mvp.md`](product/mvp.md) — the v1 cut line: the thin execution loop, build order, what's deferred. *(re-cut 2026-05-21)*
- [`product/open-questions.md`](product/open-questions.md) — undecided product questions, each with context. Resolve here, then promote the answer.
- [`PRODUCT.md`](PRODUCT.md) — the strategy / brand / principles doc (owned by the `impeccable` tooling). Strategic framing; `product/overview.md` is the current functional description.
- [`DESIGN.md`](DESIGN.md) — the working visual design brief and token/component direction for `$impeccable live` iteration.

## Architecture & conventions

- [`architecture/overview.md`](architecture/overview.md) — one-screen picture: monorepo layout, build targets, offline queue, source sync. Points at the authoritative `.cursor/rules/architecture.mdc`. Also lists the known gaps between conventions and current code.
- [`architecture/environments.md`](architecture/environments.md) — the three environments (dev/staging/production), the deploy **runbook**, migration rules (expand/contract + the destructive guard), seed data, and the CI/CD pipeline. Read this before deploying.
- [`architecture/environment-setup.md`](architecture/environment-setup.md) — the one-time **provisioning checklist**: click-by-click wiring of Neon + Cloudflare + Infisical + Depot + GitHub, with the values-to-collect matrix and end-to-end verification.
- [`architecture/decisions.md`](architecture/decisions.md) — pointer to the ADR log at [`.cursor/rules/decisions.mdc`](../.cursor/rules/decisions.mdc) (append-only). The locked stack lives there (2026-05-04 entry).
- Conventions: [`.cursor/rules/`](../.cursor/rules) — code style, UI components, React/TanStack patterns, services, DB, testing, git, workflow, Jira tickets. See [`../CLAUDE.md`](../CLAUDE.md) for which file applies when.

## Plan

- [`plan/roadmap.md`](plan/roadmap.md) — the plan by time horizon (MVP → single-player polish → team layer → Insights), plus the JIT build methodology. Replaces the deleted `.agents/STRIDE_MASTER_PLAN.md`.
- [`plan/now.md`](plan/now.md) — what's actively in flight. Small, updated often.

## Reference

- [`reference/design-prototype.md`](reference/design-prototype.md) — the current UX reference (`claude-design-files/`): the Claude Design prototype + chat transcripts. The flows, screen inventory, and data model are authoritative; the visual style is not.
- [`reference/archived.md`](reference/archived.md) — superseded material (Figma Make Files, stride-web, old wireframes, the landing page) — what each was, why it's not current, where it lives.

## How this vault works

See [`_meta/vault-conventions.md`](_meta/vault-conventions.md): frontmatter spec, the drift rule, atomic-note discipline, Obsidian compatibility. This folder is a valid Obsidian vault.
