---
title: Surfaces (screens & routes)
updated: 2026-05-12
status: current
owner: jaren
---

# Surfaces

The screen + route inventory. The surface list and route structure were confirmed 2026-05-12 (resolves the "Updates vs Today" open question — see [`open-questions.md`](open-questions.md) changelog). The per-screen *content* below is drawn faithfully from the current Claude Design prototype ([`../reference/design-prototype.md`](../reference/design-prototype.md)) and may be refined in place; the routes are settled.

## Routes

TanStack Start, file-based, flat under the app-shell layout. (`.cursor/rules/react-patterns.mdc` has been reconciled to this: `/updates` removed; `/` → Today; `/insights` and `/specs/$specId` added.)

```
__root.tsx                     providers (QueryClient, i18n, theme)
│
├── login.tsx       /login         ┐  unauthenticated — placeholder; the auth/first-run shape is open (open-questions Q11); v1 invite-only
├── signup.tsx      /signup        ┘
├── onboarding.tsx  /onboarding       placeholder — connect Jira/Linear → pick projects → first sync; shape TBD
│
└── _auth.tsx       app-shell layout (requires auth + a workspace) — left rail: Today · Backlog · Schedule · Insights, with ⚙ Settings pinned at the bottom
    ├── index.tsx           /              Today — the dashboard
    ├── inbox.tsx           /inbox         newly synced specs, handoffs, and unmapped source items before backlog planning
    ├── backlog.tsx         /backlog       Ready ↔ Breakdown ↔ Waiting ↔ All work as in-page views (?view=…); Actions can be an in-page lens, not separate routes
    ├── schedule.tsx        /schedule      week ↔ month as in-page views (?view=…)
    ├── insights.tsx        /insights      v1: Performance view only. Post-v1: + Team / Goals / Burnout / Focus Time as tabs (?tab=…), with the solo/lead persona switch as a mode
    ├── settings/…          /settings/*    workspace, source/calendar connections, … — sub-pages TBD (open-questions Q12)
    ├── specs.$specId.tsx   /specs/$specId the dedicated spec view — a real, deep-linkable route. Renders as an overlay over the page you were on when opened from inside the app; standalone when cold-loaded (deep links, "Open in Stride", "review this incoming spec")
    └── tray.tsx            /tray          the desktop tray window — compact layout, loaded by the Tauri tray window. NOT a left-rail nav item
```

Plus, **not a route — client state**: an **ad-hoc spec modal** (`openSpecId`). Pop it anywhere for a quick peek at a spec (a blocker row, an Info Hub widget, a mention) without changing the URL; it carries a "view full spec →" affordance that navigates to `/specs/$specId`. So the `/specs/$specId` route is the canonical, shareable, back-button view; the client-state modal is the ephemeral in-context quick-look.

Assumptions baked in (flag if wrong): routes are flat under `_auth.tsx`; the prototype's "Tray demo" nav entry was a demo affordance — gone in the real web nav; Backlog's Specs/Actions/Blockers, Schedule's week/month, and Insights' tabs are in-page state (search params), not routes. Round-2 items still to pin (open-questions Q11–Q12): the ⌥Space capture window's route (`/tray/capture` vs `/capture` vs not-a-route), the `/settings/*` sub-pages, and the `/onboarding`·`/login`·`/signup` shape.

## Navigation

Left rail (~200px, dark; from `Shell.jsx`): a workspace+team switcher at the top (behavior still open — [`open-questions.md`](open-questions.md) Q1), then **Today** (check icon) · **Inbox** (newly synced / newly assigned work) · **Backlog** (planned work; badge = your open-spec count, with sub-items **Specs** and **Actions**) · **Schedule** (calendar icon) · **Insights** (chart icon), then a **⚙ Settings** gear pinned to the bottom, plus a live-session mini-indicator (pulsing dot, timer, action title, End / Open) that appears at the bottom when a session is running.

---

## Today — the dashboard · `/`

The at-a-glance "what now / what's next" screen. Three zones in the main column, a configurable widget rail on the right.

- **Now hero** — start-a-session button when idle; a live-session banner with timer + an estimate-variance bar when running.
- **Up next today** — today's remaining schedule blocks. Empty-day and day-done states.
- **Earlier today** — completed blocks, dimmed.
- **Info Hub (right rail)** — toggleable, reorderable widgets: `justLanded`, `mentions` (@-mentions from sources, deep-linking back), `blockers` (specs you're waiting on, with a nudge action), `blocking` (specs others wait on you for), `dayStats`, `varianceNudge`, `weekStreak`, `teammatePulse` (who's in deep work), `upcomingMeetings`, `focusMode`. (Configurable; in v1 — the default widget set/order is a design detail.)
- The full timeline is **not** here — it's on Schedule. Today is a summary.

## Backlog — every spec, organized · `/backlog`

The workspace's spec list. Find, break down, schedule.

- **Search + filters** — by priority, by assignee (mine / unassigned / per-person), by sprint. **Comfy ↔ compact density toggle.**
- **Groups** — "Needs breakdown" (no actions yet) and "Ready to schedule" (has actions). The top ~3 most-urgent surfaced as recommended cards.
- **Inline "needs attention" chips** — *Awaiting approval*, *Closed in source · still open here*, *Blocker reported*, *Unassigned · claim*.
- **Work-mode tabs** (in-page) — Ready, Breakdown, Waiting, All work. They answer different user intents without showing every filter at once.
- **Actions lens** (in-page) — a flat, priority-ranked list of every action across all specs, with a time-accounting line: estimated · logged · planned · unaccounted.
- **Blockers/Waiting lens** — "Waiting on others" + a ranked "Chokepoints" list (specs of yours that the most teammates are blocked on). Not a peer top-level tab beside Specs and Actions.

## Schedule — the calendar · `/schedule`

Plan your week. Drag actions onto a time grid; see plan-vs-actual inline.

- **Week grid** — 7a–8p scroll range, 9a–6p working hours highlighted, 15-min snap; blocks positioned by start/duration; a "now" line; a capacity readout; week navigation (prev / next / today; other weeks show a recap state).
- **Drag interactions** — drag an unscheduled action from the right rail onto the grid; drag to move; drag handles to resize.
- **Plan vs actual — always inline, no toggle** — past blocks show actual time logged as an inset fill, with a striped overflow band if you went over.
- **Typed blocks** — `action` / `meeting` / `focus` / `break`, each with its own icon + color.
- **Month overview** (in-page) — a lower-fidelity month view alongside the week.

## Insights — analytics · `/insights`

**v1 scope: the Performance view only** — the personal stat cards (specs closed / PRs merged / hours / estimate accuracy) with `(i)` explainer tooltips, plus the estimate-vs-actual scatter. (In Team scope: a velocity trend and a roster contribution table.) *Working assumption — whether the Team tab (or more) comes into v1 is still being iterated: [`open-questions.md`](open-questions.md) Q16.*

Post-v1, `/insights` grows the rest as tabs (`?tab=…`), with a Solo ↔ Team-Lead persona switch as a mode, in roughly this priority order:

1. **Team** — "the human side": live presence/status, lead notes, signals. Throughput numbers deliberately omitted here (they live in Performance).
2. **Team Analytics / Bottlenecks** — though "Bottlenecks" largely moved to Backlog's Blockers view.
3. **Burnout** — manager early-warning: team risk score, reports sorted by risk, contributing factors, suggestions.
4. **Goals** — team + personal goals, auto-tracked from captured data (no manual % updates), with a goal-creation flow; achievements / badges.
5. **Focus Time** — a circular-timer focus surface. Whether it grows into a full Pomodoro engine is [`open-questions.md`](open-questions.md) Q7.

## Tray — the desktop cockpit · `/tray`

The always-available menu-bar window. Same web build, route `/tray`, smaller dimensions, system-tray-anchored. Not in the web left-rail nav — it's loaded by the Tauri tray window.

- **States** — `idle` (a spacious "Up next" hero with an inline "pick something else" picker) · `live session` (a circular **ArcDial** with the timer in the center, minimal chrome, End / Pause, an over-estimate indicator) · `break` (a soft countdown) · `review` (handoff).
- **Overlays** — a separate **capture window** (⌥Space — Insight vs Next; attaches to a running session, else drops to backlog) — its routing is a round-2 item; a **meeting-join flow** ("Jump into meeting" vs "Keep working" with a snooze-duration picker); start-session and end-session flows.
- **Banner** — a dismissible top banner appears *only* for time-sensitive context (meeting in ~2–5m / a just-landed spec); auto-opens once per meeting, not nagging. No notification framing — the OS handles notifications.
- Chrome notes: no Stride logo in the tray header; an icon-only corner button to open the main window (not a text button); no "Capture" label (it's the separate ⌥Space window).

## Spec view — `/specs/$specId` (route) + the ad-hoc modal (client state)

The spec detail surface — used both to inspect/edit any existing spec and to review a newly-synced incoming ticket. **Two presentations of the same thing:**

- **`/specs/$specId`** — the canonical route. Deep-linkable and back-button-friendly (shareable spec URLs, "Open in {source}" round-trips, links to "review this incoming spec"). Rendered as an overlay over the page you were on when opened from inside the app; standalone (with the app shell) when cold-loaded.
- **The ad-hoc modal** — client state (`openSpecId`). A quick peek triggered anywhere (a blocker row, an Info Hub widget, a mention) without navigating; carries "view full spec →" to the route.

Content (the same in both presentations):

- **Overview tab** — editable title; markdown description (expandable); the **Actions list with full CRUD** and the **inline "Break down" panel** (manual action creation in v1; LLM-assisted suggestions post-v1 — see [`mvp.md`](mvp.md)); **Dependencies** (blocks / blocked by / related, table-style); **Linked** items; labels.
- **Comments tab** — compose + thread + reactions/mentions; "reply posts back to source"; an unread indicator. *(Post-v1 — not in the v1 Spec view; see [`mvp.md`](mvp.md).)*
- **History tab** — audit trail of past owners + time logged per owner + the source-side activity feed.
- **Right sidebar** — source-mapped priority picker; source-mapped status picker (Jira / Linear / GitHub vocabularies — replaces a plain "Mark done"); click-to-reassign assignee; mark-done with an open-actions warning; "Open in {source}" deep link; watching toggle.
- **Banner variants** — yellow "Just landed · assigned Nm ago by X · Y broke this into N actions, M done" (handoff context); blue "Awaiting approval" with one-click accept/decline; a warning variant for "closed in source / still open here".

---

## Not standalone surfaces (handled elsewhere)

- **Onboarding** — placeholder route `/onboarding` (connect Jira/Linear → pick projects → first sync → land on Today). Whether it's a gated route before the app shell or a step inside it is open ([`open-questions.md`](open-questions.md) Q11); v1 is invite-only (no public self-serve signup).
- **Settings** — a `/settings/*` section reached via the ⚙ gear at the bottom of the left rail. Sub-pages (workspace; source + calendar connections; team + member management; notifications + privacy [deferred placeholders]) are TBD ([`open-questions.md`](open-questions.md) Q12).
- **"Needs attention"** — surfaced inline in Backlog, not its own page.
- **Performance metrics dashboard / "Activity"** — folded into Insights and the Spec view's History tab; not a separate page.
