---
title: Surfaces (screens & routes)
updated: 2026-05-30
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
├── workspaces.new.tsx /workspaces/new   focused full-screen flow to create a workspace (name → plan → connect a source); entered from the workspace switcher, not the app shell
│
└── _auth.tsx       app-shell layout (requires auth + a workspace) — left rail: Today · Backlog · Schedule · Insights, with ⚙ Settings pinned at the bottom
    ├── index.tsx           /              Today — renders a session-first or schedule-first variant per the working mode
    ├── inbox.tsx           /inbox         newly synced specs, handoffs, and unmapped source items before backlog planning
    ├── backlog.tsx         /backlog       Ready ↔ Breakdown ↔ Waiting ↔ All work as in-page views (?view=…); Actions can be an in-page lens, not separate routes
    ├── schedule.tsx        /schedule      single day view — a 24-hour canvas; date carried as ?date= (defaults to today)
    ├── insights.tsx        /insights      deferred from v1 (route not built) — see the Insights note below

    ├── settings.tsx        /settings      settings shell with deep-linkable sections (?section=…) for Personal, My workspace, Workspace admin, and Team admin settings
    ├── specs.$specId.tsx   /specs/$specId the dedicated spec view — a real, deep-linkable route. Renders as an overlay over the page you were on when opened from inside the app; standalone when cold-loaded (deep links, "Open in Stride", "review this incoming spec")
    └── tray.tsx            /tray          the desktop tray window — compact layout, loaded by the Tauri tray window. NOT a left-rail nav item
```

Plus, **not a route — client state**: an **ad-hoc spec modal** (`openSpecId`). Pop it anywhere for a quick peek at a spec (a blocker row, an Info Hub widget, a mention) without changing the URL; it carries a "view full spec →" affordance that navigates to `/specs/$specId`. So the `/specs/$specId` route is the canonical, shareable, back-button view; the client-state modal is the ephemeral in-context quick-look.

Assumptions baked in (flag if wrong): routes are flat under `_auth.tsx`; the prototype's "Tray demo" nav entry was a demo affordance — gone in the real web nav; Backlog's Specs/Actions/Blockers are in-page state (search params), not routes. Schedule is a single day route — the date is a `?date=` search param, no separate week or day-canvas route (simplified 2026-05-21). Round-2 items still to pin (open-questions Q11): the ⌥Space capture window's route (`/tray/capture` vs `/capture` vs not-a-route), and the `/onboarding`·`/login`·`/signup` shape.

## Navigation

Left rail (~200px, dark): a workspace+team switcher at the top (behavior still open — [`open-questions.md`](open-questions.md) Q1), then **Today** · **Inbox** (newly synced / newly assigned work) · **Backlog** (planned work; badge = your open-spec count, with sub-items **Specs** and **Actions**) · **Schedule**, then a **⚙ Settings** gear pinned to the bottom. Insights is not in the rail (deferred from v1). A live-session mini-indicator (pulsing dot, timer, action title) at the bottom of the rail is planned but not yet built — the running session currently lives on Today.

---

## Today · `/`

Today is **two screens behind one route**: `TodayView` reads the working mode ([`overview.md`](overview.md) → User modes) and renders one variant. It is a focused, centered, single-column surface — *not* the old four-panel dashboard. Today never owns work; it is a derived view that pulls from Backlog, the Session state, and the Schedule, and the only thing it owns is the act of working right now.

**Session-first — `SessionToday`.** Answers one question: *what do I run next, and start?*

- **Hero** — one element that cycles three states: *idle* shows the top "Up next" Action (title, source key, estimate) with a large **Start** (and a "blank focus session" link); *running* becomes a large live timer with an estimate-variance bar; *ending* becomes the feeling check-in (frown / neutral / smile / target, optional note, mark-done).
- **Later today** — a compact list of the rest of the day's blocks, each with a quiet Start.
- **Status line** — one muted row linking to the Inbox.

**Schedule-first — `ScheduleToday`.** Answers: *where am I in my day?*

- **Day-at-a-glance summary** — Worked / Planned-ahead / In-meetings stats and a two-segment capacity bar (worked, planned, free).
- **Day timeline** — the day's blocks as a vertical list with a "Now" line and the current block highlighted; past blocks dimmed. No Start buttons (schedule-first does not run timers).

The configurable Info Hub and its widget set (`justLanded`, `mentions`, `blockers`, `teammatePulse`, etc.) are **post-MVP** — they need the team layer and live signal. Today is deliberately structured so it cannot accumulate panels again.

## Backlog — every spec, organized · `/backlog`

The workspace's spec list. Find, break down, schedule.

- **Search + filters** — search across spec/action title, source key/id, labels, project/epic, and sprint; filter by assignee (mine / unassigned / per-person / everyone), priority, status, project/epic, sprint, label, attention state, and readiness. Source is determined by the selected team/source connection, not a Backlog filter. Default controls show search, assignee, priority, status, and attention, with the rest in `More filters`.
- **Groups** — "Needs breakdown" (no actions yet) and "Ready to schedule" (has actions). The top ~3 most-urgent surfaced as recommended cards.
- **Inline "needs attention" chips** — *Awaiting approval*, *Closed in source · still open here*, *Blocker reported*, *Unassigned · claim*.
- **Work-mode tabs** (in-page) — Ready, Breakdown, Waiting, All work. They answer different user intents without showing every filter at once.
- **Actions lens** (in-page) — a flat, priority-ranked list of every action across all specs, with a time-accounting line: estimated · logged · planned · unaccounted.
- **Blockers/Waiting lens** — "Waiting on others" + a ranked "Chokepoints" list (specs of yours that the most teammates are blocked on). Not a peer top-level tab beside Specs and Actions.

## Schedule — day view · `/schedule`

> **Simplified 2026-05-21.** The Schedule was two levels — a week overview that you
> navigated *into* a day canvas. It is now a **single day view**. Cut: the week view, the
> separate day-canvas route, untimed "day assignments" (every block has a real time), and
> time budgets. See [`data-model.md`](data-model.md) and the
> [`open-questions.md`](open-questions.md) changelog.

One surface: a 24-hour day canvas at `/schedule`. The viewed date is a `?date=` search param (defaults to today). It is a planning surface, not a passive calendar clone.

- **Plan / Sessions toggle** — *session-first mode only.* **Plan** (Schedule) shows planned blocks, Sessions show through as click-through context; **Sessions** (Actual) shows recorded Sessions, planned blocks show through as context. In **schedule-first** mode the toggle is hidden and the view is plan-only — planned time *is* actual time, there is no separate layer to compare.
- **24-hour canvas** — the full day, initially scrolled to the user's working-hours start (8 AM default). Off-hours stay schedulable but get a distinct visual state. A current-time indicator shows only for today. Every block sits on the timeline at a real start time — there is no "planned for the day but unplaced" state.
- **Drag and resize** — snap to 15-minute increments; drag the body to move, top/bottom handles to resize. After a drag or resize, the block is selected and its inspector opens. Overlapping blocks lay out side by side; external events participate in layout but stay immutable.
- **Scheduling tray** — a collapsible right drawer (default open). Lists Actions to place, ranked by remaining time needed: `estimate − completed session time − future scheduled time`, clamped at zero. Dragging an Action onto the canvas creates a timed, Action-linked block; resizing it never changes the Action's estimate. A single Action may have several blocks.
- **Inspector** — single-click selects a block and switches the right drawer to its inspector. Action-linked blocks lead with event details, with links out to the Action/Spec.
- **Block types** — a minimal fixed set (focus, meeting, break, buffer, research, learning, personal). Custom/archivable ScheduledEventTypes are post-MVP.
- **Navigation** — previous/next day arrows, a date picker, and a compact mini week strip for fast day hopping. No "back to week" — there is no week view.
- **Mobile** — the right drawer becomes a bottom sheet / collapsible panel.

## Insights — analytics · `/insights`

> **v1 note (2026-05-21).** The entire Insights surface is **deferred from v1** — there is
> no signal to reflect on until Sessions are real, and a decorative analytics screen
> erodes trust rather than building it. Signal *capture* still happens in v1 (the backend
> records the full execution signal from day one). Insights returns post-MVP: operational
> insights inline first (inside Today / Tray / Spec view, where they change a decision in
> the moment), a reflective surface later, when real users say what they want to see. The
> design below is the spec for when it returns. See [`mvp.md`](mvp.md).

Insights is a focused query surface, not a dashboard wall. The user picks a scope, then sees a short readout, formatted top-down with minimal chrome: a one-line takeaway, a single metrics block (four stats as a divided strip with deltas, feeding one interactive area chart for the selected stat), then two borderless lanes — a patterns or status list, and a computed "suggested next steps" list.

Scopes are **role-gated** (roles are additive — Member ⊂ Team Admin ⊂ Workspace Admin); the scope tabs only show what the viewer's role can see:

1. **Me** — *every role.* A warm but grounded personal readout: a takeaway, accomplishment stats (focus time, specs closed, actions completed, streak), a "how you work" patterns lane, and suggested next steps. Built to motivate through real captured data — not gamification, not surveillance.
2. **Projects** — *every role.* Status of the projects the user contributes to: the KPI grid plus a per-project status list with progress. This is how an individual contributor sees the progress of work they're part of.
3. **Team** — *every role.* Aggregate team flow only: pipeline counts, closure pace, focus time, estimate variance, flow by area, and stalled specs. Never per-person rows. The scope offers a variant selector (Flow / Pulse / Brief) — three readings of the same week. The shared aggregate is visible to every team member; the planning lanes (next-week coverage, planning quality, suggested next steps) are gated to *Team Admin and above*, since they are only actionable by whoever runs planning. Statistics here exist to give members shared context and to help admins improve momentum — not for comparison or micromanaging.
4. **Org** — *Workspace Admin only.* Initiative-level progress across the workspace. Like Team, the scope offers a variant selector — three readings of the same quarter: Portfolio (what initiatives exist and their state — health, progress, cycle time), Forecast (whether committed work will land and when — a cumulative burn-up plus on-track vs slipping initiatives), and Flow health (delivery as a system — median cycle time, throughput, where work piles up by stage, and aging work). Everything is initiative- or stage-level; the scope never ranks teams or individuals.

Team and Org scopes stay aggregated by area/initiative — the anti-surveillance constraint lives in the data shape, surfaced with a quiet footnote rather than a leading disclaimer. No scope ranks individuals against each other, and no scope lets one person compare themselves to another.

The "suggested next steps" lane is **rule-derived** from the metrics, not LLM-generated — LLM features are deferred post-v1 (see [`mvp.md`](mvp.md)). Until Better Auth + memberships land, a dev-only "Preview as" role switcher in the header stands in for the current user's role.

## Tray — the desktop cockpit · `/tray`

The always-available menu-bar window. Same web build, route `/tray`, smaller dimensions, system-tray-anchored. Not in the web left-rail nav — it's loaded by the Tauri tray window.

> **Design principle — the Tray is glanced at, not read.** Because it's always visible it
> must be **silent by default and informative on demand**. Anything that requires the user
> to *read* the Tray is wrong; reading happens in the main window. The choreography:
> *idle* — silent, no numbers; *pre-session click* — the context summoner (recent files,
> the parent Spec, prior Sessions on similar work); *live* — a subtle timer / ArcDial;
> *mid-session interrupt* — end-session + jot note; *post-session* — the feeling check-in
> (the one mandatory friction point, and it earns its keep). Notifications belong to the
> OS, not the Tray. **v1 ships the idle + live-session states**; the rest trails.

- **Mode-specific role** — in **session-first**, the Tray is the session cockpit. In **schedule-first**, the Tray is a quiet day compass: strict wall-clock orientation to the current planned block and what comes next. It does not create a second "active work" truth.
- **Session-first states** — `idle` shows one recommended action hero plus 2–3 alternatives, with scheduled actions boosted in priority; `live session` shows a circular **ArcDial** with the timer in the center, minimal chrome, an over-estimate indicator, and **End** only (no Pause); `check-in` stays inside the tray and matches the main session completion semantics: feeling, optional note, mark done / keep open.
- **Schedule-first states** — `scheduled block` shows the current block, time range, block type, subtle progress through the block, and the next block. There is no Start/End session affordance. `free time` shows "Free time", keeps the next block visible, and offers 2–3 priority suggestions because empty schedule space is the one moment where suggestions help rather than compete with the plan.
- **Overlays** — a separate **capture window** (⌥Space — Insight vs Next) is intentionally separate from the Tray. Capture attaches by context: active Session first, else current schedule block, else generic personal signal. Its routing is a round-2 item. A **meeting-join flow** ("Jump into meeting" vs "Keep working" with a snooze-duration picker) is also post-v1.
- **Banner** — a dismissible top banner appears *only* for time-sensitive context (meeting in ~2–5m / a just-landed spec); auto-opens once per meeting, not nagging. No notification framing — the OS handles notifications.
- Chrome notes: no Stride logo in the tray header; a small labeled corner button ("Open app" + pop-out icon) to open the main window — the label is kept because an icon alone read as too vague in testing; no "Capture" label (it's the separate ⌥Space window). For browser iteration only, a temporary dev-only **Tray preview** nav item may render the tray content inside the main app shell so mode/context switching stays fast; it is not product navigation.

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
- **Create workspace** — focused full-screen route `/workspaces/new`, entered from the **Create workspace** action in the workspace switcher (the switcher is the multi-workspace context; per-workspace Settings is the single-workspace context, so creation lives in the switcher, not Settings). It runs without the app shell — a three-step flow: **name** the workspace (you become its workspace admin) → **pick a plan** → **connect a source** (or skip). The plan step is a *visualization* of how paid tiers will look (Free / Team / Enterprise, monthly–annual toggle); **billing is not live in v1** (deferred per [`mvp.md`](mvp.md) and the 2026-05-12 open-questions decision), so the step is a preview and the flow lands you in the new workspace without charging.
- **Settings** — a `/settings` section reached via the ⚙ gear at the bottom of the left rail. The global app rail stays visible and Settings adds a secondary settings sidebar. First implementation uses `?section=…` deep links rather than nested routes. Sections are organized by ownership scope: **My workspace settings** (default), **Personal** account-wide settings, **Workspace admin** settings, and **Team admin** settings nested under the selected workspace/team context. Admin-only sections are hidden when the user lacks access. Source connections are workspace-pooled: one Jira account, one Linear account, and one GitHub organization per workspace. Team Source mapping first chooses which source type the team uses, then chooses the source unit inside that connected account or organization: a Jira board, Linear team, or GitHub repository. Each Stride Team has exactly one primary source mapping, and each external Jira board / Linear Team / GitHub repo maps to only one Stride Team per workspace. Multiple GitHub repositories per Stride Team is an open question, not current behavior. Team General settings cover the Stride team name plus workflow and breakdown behavior. Source-owned identifiers and source-to-team assignment live in Source mapping, not Team General. Team defaults do not set member working hours, working mode, notification timing, presence, or focus status. Calendar connections are personal and opted into per workspace.
- **"Needs attention"** — surfaced inline in Backlog, not its own page.
- **Performance metrics dashboard / "Activity"** — folded into Insights and the Spec view's History tab; not a separate page.
