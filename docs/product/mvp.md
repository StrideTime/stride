---
title: MVP — v1 scope
updated: 2026-05-27
status: current
owner: jaren
---

# MVP — v1 scope

**v1 is the thin execution loop, built first and layered up — not the full designed
product.** Decided 2026-05-21, superseding the 2026-05-12 "v1 = full product minus
go-to-market" call (see [`open-questions.md`](open-questions.md) changelog and the
2026-05-21 entry in [`.cursor/rules/decisions.mdc`](../../.cursor/rules/decisions.mdc)).

The reasoning: the surfaces where a developer *does the work* — Session, Spec view, Tray
— are where the irreplaceable signal is captured. The reflective surfaces (Insights) have
nothing to reflect on until that signal exists. So execution gets built and polished
first; reflection follows the signal. This is the "thin loop first, layer up" shape the
[roadmap](../plan/roadmap.md) always intended — v1 just commits to it honestly instead of
treating the whole designed product as one cut.

## MVP target

**One developer uses Stride for a week of real work and wants to keep using it.** That is
the bar — not feature-completeness, not surface count. Everything below is in v1 because
that week of real work needs it; everything deferred is deferred because it does not.

Phases past MVP are **evidence-driven, not document-driven** — see [`../plan/roadmap.md`](../plan/roadmap.md).

## The two dogfood users

v1 is validated against two real people, who happen to be the two ends of the user-mode
axis (see [`overview.md`](overview.md) → User modes):

- **Jaren — explicit-sessions mode.** Plans on a calendar to see what fits, but the
  **timer is the source of truth** because his estimates are unreliable. The primary
  dogfooder and builder.
- **His sister — planned-time mode.** Lives out of her calendar; the **plan is the truth**.
  She runs UX consultation on the project — so the schedule-first mode is designed by
  someone who actually works that way, not by a session-first person guessing.

Because both modes have a real user, the Schedule surface is **load-bearing in v1**, and
both time-accounting modes ship.

## Build order

Execution before reflection. Each step ships incrementally:

1. **Session flow, end-to-end** — start → live timer → end → feeling check-in → optional
   note → mark-done-or-keep-open. The core capture mechanism and the moment of trust
   transfer. Currently a placeholder; it is the first thing to make real.
2. **Spec view with real Actions** — Action CRUD, estimates, done-state. Not a placeholder.
3. **Schedule** — a single day view, both modes (see below), in v1.
4. **Today + Tray** — Today as two mode variants; Tray idle + live-session.
5. **"My data" view** in Settings — and **Jira one-way sync** so real specs flow in.

## In v1

- **Session flow** — start / live timer (Today + tray + sidebar mini-indicator) / end /
  feeling check-in (icons: frown / neutral / smile / target) + optional note +
  mark-done-or-keep-open. Mid-session jots. The gentle variance nudge (~1.5–2× over
  estimate). This is the core loop.
- **Spec view** — `/specs/$specId` route + the ad-hoc quick-look modal. Overview: editable
  title, markdown description, **Actions with full CRUD** (manual creation, no AI panel),
  dependencies, labels. History: audit trail. **No Comments tab.**
- **Actions** — the *execution-step* model (see [`data-model.md`](data-model.md)):
  title + estimate + done-state + relationship to time. No status workflow, no assignee,
  no source-mapped status. Project management lives in Jira; Actions make the *execution*
  of work captureable.
- **Schedule** — a **single day view** (`/schedule`, date as `?date=`): one 24-hour
  canvas, no week view, no untimed day-assignments, no time budgets (simplified
  2026-05-27). The Plan/Sessions toggle is session-first only. In v1 because both dogfood
  users need it. See [`surfaces.md`](surfaces.md).
- **Today** — two mode variants behind one route: session-first (`SessionToday`) centers
  on a hero (next Action → live timer → check-in) plus a compact "Later today";
  schedule-first (`ScheduleToday`) is the day timeline with a day-at-a-glance summary. Not
  the old four-panel dashboard. See [`surfaces.md`](surfaces.md).
- **Tray** — web implementation of both working-mode variants (the Tauri shell can
  trail). Session-first ships idle, live-session, and compact check-in states. Schedule-first
  ships the quiet day compass: strict wall-clock current block, next block, and free-time
  priority suggestions. Capture remains a separate shortcut-driven surface, not part of
  the Tray.
- **"My data" view** — in Settings. The user can see and delete their captured data:
  recent sessions, feeling check-ins, captures. Minimal is fine — a list with delete
  buttons. This ships *because* the backend captures more than it surfaces (see below);
  visible data ownership is a [`principles.md`](principles.md) commitment, not a feature
  to defer.
- **Jira sync — one-way, simple.** Specs sync in; status syncs back. OAuth; the
  webhook/queue/cron machinery from the locked stack.
- **Privacy defaults** — presence / "focus status" indicators default **off**, opt-in
  only.
- **Auth** — Better Auth, invite-only. No public signup, no billing.

### Backend captures signal even though Insights is deferred

The Insights *surface* is cut from v1. Signal *capture* is not. From day one the backend
records the full execution signal — session timings, estimate-vs-actual, feeling
check-ins, jots, what closed when — so that when Insights returns it has clean historical
data to work from. Capturing long-term data is core to how the backend is architected.

This is *why* the "my data" view is in v1: if Stride captures more than it surfaces, the
user must be able to see what was captured. See [`principles.md`](principles.md).

## Deferred (v1.x or later)

- **Insights — the entire surface.** Rebuilt when there is real signal: operational
  insights inline first (Today / Tray / Spec view), then a reflective surface when real
  users say what they want. The current `surfaces.md` Insights design is the spec for when
  it returns, not v1 work.
- **Linear + GitHub sources** — Jira alone proves the loop.
- **Calendar sync (Google / Outlook)** — deferred.
- **Schedule in its current full ambition** — the week/day canvas as specced may ship
  simplified; the elaborate drag/resize/overlap spec is post-MVP.
- **Team layer** — Workspace/Team/Membership/roles, invites, the merged view, transfer
  approval, blockers/blocking, the nudge inbox. v1 is single-user. *(Postgres RLS and
  workspace-scoped schema stay in — ripping out tenancy foundations is not worth it; only
  the team-facing UI and flows are deferred.)*
- **Offline mutation queue** — single user, one device; simple persistence is enough for
  v1. The durable SQLite queue is post-MVP.
- **ScheduledEventType customization and ActionDayAssignment** — custom schedule types are
  deferred; v1 Schedule uses a minimal fixed set of block types. Untimed day assignments
  were cut entirely when Schedule became a single day view.
- **LLM features** — AI break down, AI insights/summaries. Architecture stays LLM-ready;
  nothing LLM ships.
- **Comments** — Comments tab + reply-write-back to source.
- **Real-time presence**, **public signup / billing**, **mobile**, **the landing-page
  marketing site**.

## Architectural commitments — bake in even though they are not v1 features

These cost little now and are expensive or impossible to retrofit. See
[`principles.md`](principles.md) and the 2026-05-21 ADR entry.

- **Clean typed API**, designed as if external systems will consume it (they will, much
  later — MCP / webhooks / REST are future adapters on this internal API).
- **Asymmetric access** — per-person signal in the DB; the aggregate API surface cannot
  return individual rows.
- **Honest deletion** — hard deletes that recompute aggregates without the deleted data.
- **Source-native storage** — source-specific fields stored source-native; normalized at
  the display layer, not the data layer (see [`data-model.md`](data-model.md)).
- **Cross-cutting attachment point** — an empty junction table so a future "Concept"
  entity can attach to any Stride entity (see [`data-model.md`](data-model.md)). Not
  populated in v1.
- **Provenance-ready** — when the first derived value ships (post-v1, with Insights), it
  carries lineage from day one. Not built in v1, but not designed out of.

## What this implies for the BE

`apps/api` + `packages/db` need roughly: **User, Workspace** (workspace-scoped schema +
RLS stay in, even single-user); **SourceConnection** (Jira only — credentials, mapping,
sync state); **Spec, Action, Session**; **Capture**; the signal-capture tables; the
cross-cutting junction table (empty); `processed_mutations` only if the offline queue is
kept (deferred — likely not v1). Hono routes for each. **One sync ingest: Jira.** Better
Auth (invite-based). **No LLM service, no comments, no Linear/calendar, no team-layer
routes** in v1. Build trailing the FE by one screen.
