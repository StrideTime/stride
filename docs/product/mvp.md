---
title: MVP — v1 scope
updated: 2026-05-14
status: current
owner: jaren
---

# MVP — v1 scope

**v1 = the full product as designed, minus the go-to-market layer.** Decided 2026-05-12 (the scope-lever Q&A): the four deep surfaces *and* the desktop tray; Jira + Linear; the full team layer with roles — all at prototype fidelity — with public self-serve signup, billing, and marketing onboarding deferred, and "dogfood-level" polish on that deferred layer. It's a "v1.0 scope," not a thinnest-shippable MVP; the build *order* (thin loop first, layer up) lives in [`../plan/roadmap.md`](../plan/roadmap.md) — you still ship incrementally, this is just the eventual v1 surface.

The BE entities + endpoints follow from this list. Build trailing the FE by one screen.

## In v1

### Surfaces — prototype fidelity ([`surfaces.md`](surfaces.md))

- **Today** (`/`) — now/next hero, today's schedule, the configurable Info Hub with all its widgets (`justLanded`, `mentions`, `blockers`, `blocking`, `dayStats`, `varianceNudge`, `weekStreak`, `teammatePulse`, `upcomingMeetings`, `focusMode`). The widgets that need the team layer / source-activity / calendar are all in v1, so the full hub ships.
- **Backlog** (`/backlog`) — Specs ↔ Actions ↔ Blockers views; search across titles/source keys/labels/project/sprint; filters for assignee, priority, status, project/epic, sprint, label, attention state, and readiness; source comes from the selected team/source connection; recommended cards; the needs-attention chips (awaiting approval / closed-in-source / blocker reported / unassigned-claim).
- **Schedule** (`/schedule`) — week + month; drag-to-schedule / move / resize; plan-vs-actual inline; typed blocks (action / meeting / focus / break); capacity readout; week navigation + recap states. Meeting blocks come from the calendar sync (below).
- **Insights** (`/insights`) — **v1: the Performance view** (personal stat cards — specs closed / PRs merged / hours / estimate accuracy — with `(i)` explainers; the estimate-vs-actual scatter; in team scope, a velocity trend + roster contribution table). *Whether the Team / Goals / Burnout / Focus Time tabs come into v1 is still being iterated — see [`open-questions.md`](open-questions.md). Performance-only is the working assumption.*
- **Tray** (`/tray`, desktop) — **full**: idle / live-session (arc dial) / break / review states; the ⌥Space capture window; the meeting-join flow (real — off the calendar sync); the time-sensitive top banner. One Tauri binary, two windows; native SQLite for the offline queue.
- **Spec view** — `/specs/$specId` (the deep-linkable route) + the ad-hoc client-state quick-look modal. **Tabs: Overview + History — no Comments tab in v1** (see deferred). Overview: editable title, markdown description, **Actions with full CRUD — manual creation, no AI panel**, Dependencies (blocks / blocked-by / related), Linked items, labels. History: audit trail, time logged per owner, source activity feed. Sidebar: source-mapped priority + status pickers, click-to-reassign, mark-done with open-actions warning, "Open in {source}", watching toggle. Banner variants: just-landed/handoff, awaiting-approval (with the transfer-approval flow), closed-in-source warning.

### Mechanics

- **Sources: Jira + Linear.** OAuth; webhook ingest → CF Queue → consumer Worker → Neon; CF Cron polling fallback; status/priority mapping at connect time; source-vocabulary display everywhere; Stride creates issues in a source only during break-down. (GitHub stays a *future* connector — the model is source-agnostic, but no GitHub in v1.)
- **Calendar sync: Google Calendar** (Outlook in v1 or v1.x — see [`open-questions.md`](open-questions.md)). Meetings sync in; they power the Schedule's meeting blocks, the Today "upcoming meetings" widget, and the tray's meeting-join prompt. *This is the one place v1 goes beyond the current prototype.*
- **Break down: manual.** Add / edit / reorder / delete actions, set estimates. **No LLM in v1** — but the architecture leaves room to add an AI-suggest panel (and other LLM features) later without rework.
- **Sessions.** Start → live timer (Today + tray + sidebar mini-indicator) → end → feeling check-in (icons: frown/neutral/smile/target) + optional note + mark-done-or-keep-open. Mid-session jots/captures. The gentle variance nudge (~1.5–2× over estimate).
- **Capture.** The ⌥Space quick-note popover (Insight / Next; attaches to a running session, else drops to the backlog).
- **Team layer.** Workspace + Team + Membership + roles (Member ⊂ Team Admin ⊂ Workspace Admin); invite flow; the "all teams" merged view; reassignment with the cross-team transfer-approval gate; blockers / blocking (waiting-on-others + chokepoints data); the nudge inbox (outbound + inbound). Admin parity: admins see the same task views + gain approve/edit. **Teammate status is poll-refreshed, not real-time** (real-time is post-v1).
- **Auth: Better Auth, invite-only.** v1 accounts are created via invite — no public self-serve signup, no billing. (`/signup` may not exist in v1; the auth/onboarding route shape is still open — [`open-questions.md`](open-questions.md) Q11.)
- **Tenancy.** Postgres RLS per workspace/team — real, required for the team layer.
- **Offline.** The durable SQLite mutation queue — web: wa-sqlite/OPFS (COOP/COEP headers on CF Workers responses); desktop: Tauri SQL plugin. Optimistic updates; FIFO drainer with exponential backoff; `processed_mutations` idempotency; the rejected-mutation UI on 409 / 422 / 403.
- **Settings.** Workspace settings; source connections (Jira / Linear / Google Calendar); team + member management. (Notifications / privacy settings: deferred placeholders.)

## Deferred (v1.x or later)

- **LLM features** — AI-assisted break down, AI insights/summaries, any LLM-dependent feature. The architecture stays LLM-ready; nothing LLM ships in v1.
- **Comments** — the Comments tab in the Spec view + reply-write-back to source. Entirely out of v1.
- **Insights — the rest** — Team / Goals / Burnout / Focus Time tabs + the solo/lead persona switch. *Under iteration — may shift into v1; see open-questions.*
- **Real-time presence** — WebSocket / CF Durable Objects live presence. Post-v1 per `.cursor/rules/decisions.mdc`. (v1 teammate-status is polled.)
- **Public self-serve signup + billing + paid plans** — v1 is invite-only / private.
- **Mobile** — Expo app. No current design for the present model.
- **GitHub source** — connector is post-Jira/Linear; the data model is source-agnostic already.
- **Habits / full Pomodoro engine** — absent from the current prototype; not in scope unless re-added (the "Focus Time" surface rides with the Insights-rest deferral).
- **Billing / Admin app** — out.
- **The `landing-page/` marketing site** — separate, parked ([`../reference/archived.md`](../reference/archived.md)); not part of the app's v1.

## What this implies for the BE

`apps/api` + `packages/db` need roughly: **User, Workspace, Team, Membership** (with role); **SourceConnection** (per Jira/Linear connection — credentials, team/board↔Stride-team mapping, status/priority mapping, sync state) and **CalendarConnection** (Google — credentials, sync state); **Spec, Action, Session, ScheduleEntry** (incl. calendar-sourced meeting blocks), **Capture, Nudge**; the **transfer/approval** record; **`processed_mutations`** (idempotency). Hono routes for each. **Three sync ingests**: Jira (webhook + cron), Linear (webhook + cron), Google Calendar. Better Auth (invite-based) + Postgres RLS. **No LLM service, no comments tables/routes** in v1. Build trailing the FE by one screen ([`../plan/roadmap.md`](../plan/roadmap.md) Phase 3).

## Still being refined within v1

- **Insights v1 scope** — Performance-only vs. pulling in the Team tab (or more). Iterating ([`open-questions.md`](open-questions.md)).
- **Calendar providers** — Google in v1; Outlook in v1 or v1.x?
- **Auth / onboarding route shape** — invite-only is decided; the `/login` / `/onboarding` flow shape isn't ([`open-questions.md`](open-questions.md) Q11).
- **Per-surface depth** — assumed = prototype fidelity; flag exceptions if any surface should ship lighter.
