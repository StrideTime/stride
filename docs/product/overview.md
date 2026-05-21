---
title: What Stride is
updated: 2026-05-14
status: draft
owner: jaren
---

# What Stride is

Stride is a **work-tracking tool for software teams that sits on top of issue trackers** — Jira, Linear, and GitHub. Tickets sync in from those systems as **specs**. You break each spec into small, concrete **actions**. You place actions on a calendar as time blocks, run timed **sessions** against them, and log how it went at the end. That data — estimates vs actuals, what closed, where time went, how it felt — powers a personal productivity loop for the individual contributor and aggregate patterns for the team lead.

The pitch: make daily work feel **purposeful and winnable**, not monitored. Closing a spec, finishing a session, hitting a streak should register and feel good — without being cartoon-gamified.

## The model in one breath

```
Spec        — a ticket synced from Jira / Linear / GitHub
  └── Action — Stride-native; 1+ per spec; the thing you actually do
        └── Session — a timed work block on an action

Standalone Action — a personal task with no parent spec (title + estimate only)
  └── Session
```

**Execution always goes through an Action.** Sessions never attach directly to a spec. A spec has at least one action before work begins (a 1:1 spec→action is fine for trivial work). There are no Stride-native specs — every spec comes from a source system. Details and the source-mapping table: [`data-model.md`](data-model.md).

## Long-term vision

Stride's role is to be the developer's **interface to the team's collective intelligence** — the place where work begins, where the context needed to start is summoned, and where the loop closes when work completes. The execution layer is structurally privileged for this: planning tools capture *intent* (which ages poorly); execution tools capture *reality* (which is irreplaceable).

v1 is the execution-layer foundation — nothing more. Future versions add the signal-synthesis and context-summoning layers that make the larger vision real. Every product decision should be checkable against this stated direction *and* against [`principles.md`](principles.md): the vision is only worth building if Stride stays the tool that respects the person, never the tool that surveils them.

## Who it's for

- **Individual contributors — the primary user.** Runs sessions, breaks down and closes specs, wants to understand their own productivity without overhead. Even solo users sit in a team context; Stride is most valuable paired with an existing tracker.
- **Team leads / workspace admins — secondary.** Need aggregate visibility (throughput, estimates vs actuals, team patterns, burnout signals) and never individual-level surveillance. Roles are additive: Member ⊂ Team Admin ⊂ Workspace Admin — admins get the same task views plus approve/edit. The nitty-gritty stays personal. (Full strategic framing: [`../PRODUCT.md`](../PRODUCT.md).)

## User modes

There are two ways people relate to their day, and they are **irreconcilable** — not a setting to compromise on, but a mode to commit to, picked at onboarding, after which navigation and defaults shift to match:

- **Session-first / explicit-sessions.** The calendar is a planning *guide*; recorded **Sessions are the source of truth** for actual time. Today leads with a prominent Start affordance; feeling check-ins happen at session end; the Tray shows the timer.
- **Schedule-first / planned-time.** The **Schedule is the source of truth**; planned blocks count as time worked as the day plays out. Today *is* the day view with the current block highlighted; feeling check-ins happen at end-of-block; the Tray shows the current block. (Schedule-first has an inherent privacy advantage — plans are intentional and don't trigger the surveillance instinct that logged time can.)

A possible third mode if it's cheap: **bookend tracking** — log Sessions retroactively, no live timer.

The two are not abstract: Stride's two dogfood users embody them — Jaren is session-first, his sister (who runs UX consultation) is schedule-first. The schedule-first mode is therefore designed by someone who actually works that way. See [`mvp.md`](mvp.md).

## Surfaces

Five screens plus a modal — see [`surfaces.md`](surfaces.md) for each in detail (v1 ships a subset and in a specific order — see [`mvp.md`](mvp.md)):

- **Today** — the dashboard: a "now / next" hero, today's schedule, and a configurable right-rail Info Hub of widgets.
- **Backlog** — every spec in the selected team/source scope, with search and filters for assignee, priority, status, project/sprint, labels, attention, and readiness; grouped by "needs breakdown" vs "ready to schedule"; toggles to an Actions view and a Blockers view.
- **Schedule** — week (and month) calendar; drag actions onto it; plan-vs-actual shown inline.
- **Insights** — analytics with a solo / team-lead switcher: performance, team status, goals (and burnout / focus time as later expansions).
- **Tray** — the desktop menubar window; a compact "cockpit" mirroring the web app (idle / live-session / break / meeting prompt).
- **Spec modal** — the Jira-style detail overlay for any spec: overview (with inline "break down" AI panel), comments (post back to source), history.

## Platforms

- **Web — primary.** TanStack Start (SSR).
- **Desktop — companion.** One Tauri 2 binary, two windows: the main window loads the web app's SPA build at `/`; the tray window loads the same build at `/tray`. No separate desktop React codebase. The tray is the differentiator — an always-available cockpit.
- **Mobile — future.** Expo / React Native. No current design for the present model (the only mobile artifact, `Figma Make Files/MOBILE_DESIGN.md`, is for an older concept — see [`../reference/archived.md`](../reference/archived.md)).

Full stack: [`../architecture/overview.md`](../architecture/overview.md) → `.cursor/rules/architecture.mdc`.

## Stance notes

- **Source vocabulary always wins in the UI.** Stride has internal states, but it displays Jira / Linear / GitHub's own priority and status names; the mapping is set when a source is connected.
- **Minimal gamification.** Streaks and achievements derived from real captured data. Icons, not emojis. No points-for-points'-sake. (An older prototype had a 3-points-per-task model — dead; see [`../reference/archived.md`](../reference/archived.md).)
- **UX before UI.** The current prototype's flows, screen inventory, and data model are authoritative; its visual style is not. Per the user: "nail down experiences before nailing down a design library."
- `PRODUCT.md` predates two refinements that this doc reflects: GitHub as a third source (it says "Jira and Linear"), and the rejection of "shipped" as a metric label (use "specs closed" / "PRs merged"). Treat `overview.md` as the current functional description; `PRODUCT.md` as the strategic frame.
