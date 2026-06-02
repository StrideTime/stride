---
title: Open product questions
updated: 2026-06-02
status: current
owner: jaren
---

# Open product questions

Things raised during design and not firmly resolved. Each has context so it can be picked up cold. Numbers are **stable IDs** — when an item resolves, mark it `[resolved]` in place (keep the slot) and add a one-liner to the changelog at the bottom; new items get the next number. Record the actual decision where it belongs (`overview.md` / `surfaces.md` / `data-model.md` / `mvp.md`, or — if it's an architecture decision — `.cursor/rules/decisions.mdc`).

## Surfaces & navigation

1. **Workspace + team switcher behavior.** Is it one combined selector? Does it communicate the user's admin status per row? The current `Shell.jsx` switcher is a static stub ("Stride · Acme · Platform") that doesn't reflect a settled design.
2. ~~**Today's Info Hub: configurable in v1, or a fixed set first?**~~ — **[resolved 2026-05-12]** configurable, in v1 (v1 = prototype fidelity). The *default* widget set + order is a design detail, not an open product question.
16. ~~**Insights v1 scope.**~~ — **[resolved 2026-05-21]** The entire Insights surface is deferred from v1 — there is no signal to reflect on until Sessions are real. Signal *capture* still happens in v1. Insights returns post-MVP: operational insights inline first, a reflective surface later. See [`mvp.md`](mvp.md).

## Data model & mechanics

3. ~~**Is an Action ever 1:1 with a source issue, or always strictly smaller?**~~ — **[resolved 2026-05-21]** The question dissolves under the *execution-step* model: an Action is a function of how work *decomposes*, not how source tickets are *shaped*. A 1:1 Spec→Action is fine for trivial work; a complex Spec decomposes into several. See the Action entity in [`data-model.md`](data-model.md).
4. ~~**Do "Later" / "Snoozed" / "Archive" / "Reassign" collapse?**~~ — **[resolved 2026-06-02]** The premise was stale prototype-era text; none of those shelf states exist in the built backlog. The backlog organizes by **derived views** (Breakdown / In Flight / Blocked / Next Up / Completed) computed from primitives, plus the internal `Spec.status` (`open | closed`). Nothing to collapse. Recorded in [`data-model.md`](data-model.md) and the 2026-06-02 ADR.
5. **Default teammate visibility.** When you look at a teammate, do you see load-only, or their full Today? Privacy-sensitive — ties to the "visibility without surveillance" principle in [`../PRODUCT.md`](../PRODUCT.md).
6. **Label/tag grouping.** The user floated grouping labels by "feature within a project." The prototype keeps a flat `labels[]`. In or out?
7. **Focus Time / Habits.** v1: out (per [`mvp.md`](mvp.md) — "Focus Time" rides with the Insights-rest deferral; habits are absent from the current prototype). Open: do habits return post-v1, and is "Focus Time" meant to grow into a full Pomodoro engine, or stay a simple timer? (Old design in `Figma Make Files/IMPLEMENTATION_GUIDE.md` — see [`../reference/archived.md`](../reference/archived.md).)
8. ~~**Reopen behavior.**~~ — **[resolved 2026-06-02]** Reopening a closed Spec is a **manual status flip** of the internal `Spec.status` back to `open`; existing Actions, Sessions, and past ScheduledEvents are left untouched as immutable history (no auto-revival, no new-cycle entity). The "closed in source / still open here" warning is just a surfaced mismatch between `sourceStatus` and internal `status`. See [`data-model.md`](data-model.md).
21. ~~**In-session content signal.**~~ — **[resolved 2026-06-02]** v1 records **timeshape only** (duration, feeling), but the Session table ships a nullable `contentSignal` (JSON) + `signalSource` slot from day one so git/file correlation can land later with **no migration**. The correlation itself (commits in the Session window, files touched) stays deferred to the desktop integration surface. See [`data-model.md`](data-model.md).

## Integrations

9. **Slack.** The user mentioned leveraging Slack ("saved messages" was unclear) and deferred it. What's the actual integration, if any?
10. **GitHub source.** Deferred from v1 (sources in v1 are Jira + Linear; the data model is source-agnostic already). When GitHub lands: issues only, or issues + PRs handled as distinct things? Also decide whether a Stride Team can map to multiple GitHub repositories, or whether the one-source-unit-per-team rule should stay intact for GitHub too.
17. **Calendar providers.** Calendar sync as a whole is now **deferred from v1** ([`mvp.md`](mvp.md)) — provider choice is moot until it returns. When it does: Google first; Outlook / Apple / CalDAV TBD; recurring-event handling, all-day events, declined-event filtering to spec then.

## Routing — round-2 details

11. **Auth & first-run routing.** Invite-only is decided for v1 (no public self-serve signup, no billing). *Partial:* auth placeholders are grouped under `/auth/login` and `/auth/signup`, and the standalone `/onboarding` route was removed. Workspace **creation** has a settled shape — a focused full-screen `/workspaces/new` flow (name → plan → connect a source) entered from the workspace switcher (see [`surfaces.md`](surfaces.md)). Its plan step is a non-functional pricing *preview*; billing stays deferred, so this resolves where workspace creation lives without reopening the billing decision. **[resolved 2026-06-02]** Onboarding is **account-first**: a person creates a User account first, then runs workspace creation (plan preview → name → invite teammates). The founder flow mints User + Workspace + Membership(workspace_admin); invite acceptance is a magic link that mints a Member Membership and drops them inside the workspace. There is **no standalone signup surface** — `/auth/login` serves returning users; the `/auth/signup` placeholder collapses into the workspace-creation and invite-acceptance flows. (Step order is account → workspace, refining the earlier `/workspaces/new` "name → plan → connect" sketch.)
12. **Tray sub-routes & Settings route details.** The ⌥Space capture window — a route (`/tray/capture` vs a top-level `/capture`) or rendered another way (a separate Tauri window, not router-driven)? ~~And what are the `/settings/*` sub-pages?~~ — **[settings resolved 2026-05-19]** Settings starts as `/settings?section=…`, organized by ownership scope: My workspace settings, Personal, Workspace admin, Team admin.

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

- **2026-06-02 — Backend platform confirmed; Q4 / Q8 / Q11 / Q21 resolved.** Cloudflare + Neon confirmed over Convex (ADR 2026-06-02; [`backend-platform-considerations.md`](../architecture/backend-platform-considerations.md) closed). Q4 dissolved — backlog views/readiness are derived, not stored shelf states. Q8 reopen = manual `Spec.status` flip, history untouched. Q11 onboarding is account-first with magic-link invites, no standalone signup. Q21 Session ships a nullable `contentSignal` slot, timeshape-only in v1.
- **2026-05-30 — Team General settings narrowed.** Team admin General settings now cover the Stride team name plus workflow and breakdown behavior. Source-owned identifiers and source-to-team assignment live in Source mapping, not Team General. They do not seed or override member working hours, working mode, notification timing, presence, or focus status; those remain personal settings per `principles.md`.
- **2026-05-27 — Time budgets cut.** Removed the TimeBudget feature from Settings, Schedule, Insights, and the conceptual model. Category-level time goals added too much settings weight for the execution loop.
- **2026-05-21 — Schedule simplified to a single day view.** Cut the week view, the separate day-canvas route, and untimed `ActionDayAssignment` day-level intent. `/schedule` is now one 24-hour day canvas with the date carried as `?date=`. The Plan/Sessions toggle is session-first only. Recorded in [`surfaces.md`](surfaces.md), [`data-model.md`](data-model.md), [`mvp.md`](mvp.md).
- **2026-05-21 — Working mode is a personal setting; Today rebuilt around it.** The session-first vs schedule-first mode is an app-wide, account-level setting (an `AppMode` context + a Settings control), not a team-default-with-override (which the old `data-model.md` time-accounting wording is now corrected away from). Today is two variants behind one route — `SessionToday` and `ScheduleToday`.
- **2026-05-21 — v1 scope re-cut.** Supersedes the 2026-05-12 "v1 = full product minus go-to-market" decision. v1 is now the thin execution loop, built execution-first: Session flow, Spec view + real Actions, Schedule (both modes), simplified Today + Tray, a "my data" view, one-way Jira sync. Deferred: Insights surface, Linear/GitHub, calendar, team layer, offline queue, ScheduledEventType customization, LLM, comments. Cut: TimeBudget and ActionDayAssignment. Recorded in [`mvp.md`](mvp.md); architectural commitments in [`.cursor/rules/decisions.mdc`](../../.cursor/rules/decisions.mdc) (2026-05-21).
- **2026-05-21 — Product principles established.** New [`principles.md`](principles.md): the purpose statement, the "is the data theirs?" test, privacy reframed as a data-integrity requirement, and six enforced commitments. `CLAUDE.md` points to it.
- **2026-05-21 — Q3 resolved.** "Is an Action 1:1 with a source issue" dissolves under the execution-step model — see [`data-model.md`](data-model.md).
- **2026-05-21 — Q16 resolved.** Insights surface deferred from v1 entirely.
- **2026-05-21 — Q21 added.** In-session content signal (git correlation) — flagged, deferred.
- **2026-05-19 — Settings scope model decided.** Settings uses `/settings?section=…` inside the app shell with a secondary settings sidebar. Sections are organized by ownership scope; admin-only sections are hidden without access. Source connections are workspace-pooled, Team Admins can add pooled connections from team settings, each Team has exactly one primary source mapping, source units are unique per Workspace, and calendars are personal and opt-in per Workspace. The original team-hours seed note is superseded by the 2026-05-30 Team defaults narrowing above.
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
