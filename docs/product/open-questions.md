---
title: Open product questions
updated: 2026-05-13
status: current
owner: jaren
---

# Open product questions

Things raised during design and not firmly resolved. Each has context so it can be picked up cold. Numbers are **stable IDs** — when an item resolves, mark it `[resolved]` in place (keep the slot) and add a one-liner to the changelog at the bottom; new items get the next number. Record the actual decision where it belongs (`overview.md` / `surfaces.md` / `data-model.md` / `mvp.md`, or — if it's an architecture decision — `.cursor/rules/decisions.mdc`).

## Surfaces & navigation

1. **Workspace + team switcher behavior.** Is it one combined selector? Does it communicate the user's admin status per row? The current `Shell.jsx` switcher is a static stub ("Stride · Acme · Platform") that doesn't reflect a settled design.
2. ~~**Today's Info Hub: configurable in v1, or a fixed set first?**~~ — **[resolved 2026-05-12]** configurable, in v1 (v1 = prototype fidelity). The *default* widget set + order is a design detail, not an open product question.
16. **Insights v1 scope.** Performance-view-only is the working assumption ([`mvp.md`](mvp.md)); the user wants to iterate on whether the **Team** tab (and/or Goals / Burnout / Focus Time) come into v1. Reopened 2026-05-12 — see changelog.

## Data model & mechanics

3. **Is an Action ever 1:1 with a source issue, or always strictly smaller?** Raised repeatedly, never decided. The prototype has both multi-action and single-action specs, so de facto "1:1 allowed" — but it's not a stated rule. Affects breakdown UX and how "needs breakdown" is computed.
4. **Do "Later" / "Snoozed" / "Archive" / "Reassign" collapse?** The user said there are "too many actions that realistically won't all get used at once" and these "feel like they should be handled differently." Which are primary, which merge into one state?
5. **Default teammate visibility.** When you look at a teammate, do you see load-only, or their full Today? Privacy-sensitive — ties to the "visibility without surveillance" principle in [`../PRODUCT.md`](../PRODUCT.md).
6. **Label/tag grouping.** The user floated grouping labels by "feature within a project." The prototype keeps a flat `labels[]`. In or out?
7. **Focus Time / Habits.** v1: out (per [`mvp.md`](mvp.md) — "Focus Time" rides with the Insights-rest deferral; habits are absent from the current prototype). Open: do habits return post-v1, and is "Focus Time" meant to grow into a full Pomodoro engine, or stay a simple timer? (Old design in `Figma Make Files/IMPLEMENTATION_GUIDE.md` — see [`../reference/archived.md`](../reference/archived.md).)
8. **Reopen behavior.** What happens to actions/sessions/schedule when a closed spec is reopened (in Stride or in the source)? The prototype mocks a "closed in source / still open here" warning state but the full reopen flow isn't pinned down.

## Integrations

9. **Slack.** The user mentioned leveraging Slack ("saved messages" was unclear) and deferred it. What's the actual integration, if any?
10. **GitHub source.** Deferred from v1 (sources in v1 are Jira + Linear; the data model is source-agnostic already). When GitHub lands: issues only, or issues + PRs handled as distinct things?
17. **Calendar providers.** Google Calendar is in v1 ([`mvp.md`](mvp.md)). Is **Outlook** also v1, or v1.x? Any others (Apple / CalDAV)? Recurring-event handling, all-day events, declined-event filtering — to spec when this is built.

## Routing — round-2 details

11. **Auth & first-run routing.** Invite-only is decided for v1 (no public self-serve signup, no billing). Still open: the `/login` / `/onboarding` route shape — is onboarding a gated route *before* the app shell, or a step *inside* it? Does `/signup` exist at all in v1 (invites may create accounts directly)?
12. **Tray sub-routes & `/settings/*` sub-pages.** The ⌥Space capture window — a route (`/tray/capture` vs a top-level `/capture`) or rendered another way (a separate Tauri window, not router-driven)? And what are the `/settings/*` sub-pages (workspace, source connections, calendar connection, team/member management; notifications [deferred], privacy [deferred])?

## Architecture — desktop integration

18. **Desktop auth transport.** Leaning: a bearer token in the OS keychain (Better Auth bearer mode for desktop, cookie mode for web) — avoids cross-site-cookie friction with the `tauri://` origin. Confirm when building `apps/desktop` / wiring Better Auth. The planned approach is recorded in [`.cursor/rules/architecture.mdc`](../../.cursor/rules/architecture.mdc).
19. **Desktop OAuth callbacks.** How the Jira / Linear / Google Calendar connect flows return to the desktop app: `tauri-plugin-deep-link` (custom protocol `stride://oauth/callback`) vs a localhost loopback the app spins up. Decide when building the connect flows.
20. **Mutation drainer location on desktop.** Leaning: the Rust backend (single owner, survives window close), not a webview task — refines the older "main window owns the drainer" note. Confirm when building the Tauri SQLite driver in `packages/queue`.

## Doc / repo hygiene (not strictly product, but open)

13. ~~**`apps/server` → `apps/api`?**~~ — **[resolved 2026-05-13]** directory renamed to `apps/api` to match `.cursor/rules/*.mdc`, the git commit scopes, and the build commands. The contents are still the `@hono/node-server` starter; the CF Workers rewrite is Phase 3.
14. **`PRODUCT.md` accuracy.** It says "Jira and Linear" (GitHub is a future source; in v1 it's Jira + Linear) and uses "shipped" (rejected as a metric label — use "specs closed" / "PRs merged"). Update `PRODUCT.md`, or leave it as the strategic frame and let [`overview.md`](overview.md) carry current truth (which is what it does now).
15. **`landing-page/` fate.** It's on a different stack (MUI 7 + Emotion + `@stridetime/branding`/`@stridetime/theme`, packages not in the monorepo) and predates the 2026-05-04 reset. Rebuild to match the app stack? Keep deliberately separate? Retire? See [`../reference/archived.md`](../reference/archived.md).

---

## Changelog

- **2026-05-13 — Q13 resolved.** `apps/server` renamed to `apps/api`. Aligns the directory with the conventions (which already said `apps/api`); contents unchanged — the CF Workers rewrite is Phase 3.
- **2026-05-12 — Desktop / TanStack Start integration approach documented** in [`.cursor/rules/architecture.mdc`](../../.cursor/rules/architecture.mdc): the desktop app is `apps/web`'s SPA build (`BUILD_TARGET=desktop`) wrapped by a Tauri 2 shell (two windows; one shared native SQLite; the mutation drainer Rust-side); data access via `packages/api-client` (configurable base URL), not server functions; the Query cache persisted for offline reads; desktop auth via bearer-token-in-keychain. Auth-transport / OAuth-callback / drainer-location specifics → Q18–Q20. Refines the 2026-05-04 decision; an ADR refinement is pending.
- **2026-05-12 — v1 scope decided** (the scope-lever Q&A). v1 = the full product as designed minus the go-to-market layer: the four deep surfaces + the full desktop tray; Jira + Linear; the full team layer with roles; all at prototype fidelity; with public self-serve signup, billing, and marketing onboarding deferred. Recorded in [`mvp.md`](mvp.md).
- **2026-05-12 — LLM features out of v1.** No AI-assisted break down, no AI insights, nothing LLM-dependent in v1; break down is manual. The architecture stays LLM-ready for later. Recorded in [`mvp.md`](mvp.md).
- **2026-05-12 — Comments out of v1.** No Comments tab in the Spec view, no reply-write-back to source, in v1. Recorded in [`mvp.md`](mvp.md) + [`surfaces.md`](surfaces.md).
- **2026-05-12 — Calendar sync in v1.** Google Calendar; meetings sync in (powers the Schedule meeting blocks, the Today "upcoming meetings" widget, the tray meeting-join prompt). Adds a connector beyond the prototype. Outlook/others = Q17. Recorded in [`mvp.md`](mvp.md).
- **2026-05-12 — Insights v1 scope reopened.** Earlier (same day) "Performance view only" was the call; the user wants to iterate further before locking it. Now tracked as Q16; `mvp.md` keeps Performance-only as the working assumption.
- **2026-05-12 — Q2 resolved.** Today's Info Hub is configurable and in v1.
- **2026-05-12 — "Updates" surface resolved.** It's "Today", at `/`. Reconciled in `.cursor/rules/react-patterns.mdc` + `.cursor/rules/ticket-conventions.mdc`. Recorded in [`surfaces.md`](surfaces.md).
- **2026-05-12 — Spec view shape resolved.** A deep-linkable route `/specs/$specId` plus an ad-hoc client-state quick-look modal. Recorded in [`surfaces.md`](surfaces.md).
- **2026-05-12 — Left-rail nav resolved.** Today · Backlog · Schedule · Insights, with Settings as a ⚙ gear pinned to the bottom; `/tray` is a route the desktop shell loads, not a nav item. Recorded in [`surfaces.md`](surfaces.md).
