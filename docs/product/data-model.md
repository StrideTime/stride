---
title: Data model (conceptual)
updated: 2026-06-02
status: draft
owner: jaren
---

# Data model — conceptual

The shape of the domain. This is the *conceptual* model for product reasoning — the **authoritative database schema** lives in `packages/db` (Drizzle + drizzle-zod) and its conventions in [`.cursor/rules/db-patterns.mdc`](../.cursor/rules/db-patterns.mdc); the core-model rules (and source-sync boundaries) are in [`.cursor/rules/architecture.mdc`](../.cursor/rules/architecture.mdc). When this doc and the schema disagree, the schema is reality and this doc is the bug.

## Core hierarchy

```
Workspace (tenant — solo or team; RLS-isolated)
  ├── Team           maps to a Jira board / Linear Team / GitHub Repository
  │     └── Project  optional — maps to a Jira Epic / Linear Project / GitHub Milestone
  │           └── Spec      synced from the source system; never Stride-native
  │                 └── Action   Stride-native; 1+ per Spec
  │                       └── Session   actual timed work on an Action
  ├── ScheduledEventType    category for planned/actual calendar time; seeded defaults + user custom types
  └── ScheduledEvent        planned time block; may point to an Action or be generic/external

Standalone Action — no parent Spec; a personal task (title + estimate only)
  └── Session
```

**Hard rules** (from `architecture.mdc` — do not break without a new decision entry):
- Execution always ties to an **Action**. A Session never attaches directly to a Spec.
- A Spec always has ≥ 1 Action before work begins. A 1:1 Spec→Action is valid for trivial work.
- All Specs have a source system. There are no Stride-native Specs; standalone tasks use Actions.
- Issues sync regardless of Epic/Project/Milestone membership — ungrouped issues appear uncategorized, never hidden.

## Entities and their fields

Field lists below come from the prototype's mock store (`Store.jsx`) — they're a faithful sketch of intent, not the final schema. Every persisted table also carries `id` (client-generated UUID, `text`), `createdAt`, `updatedAt`, and `deleted` (soft delete) per `db-patterns.mdc`.

### Spec
A ticket synced from a source.
- `sourceType` — `jira | linear | github`
- `sourceId` — the issue key/id in the source (e.g. `PLAT-501`)
- `sourceUnitId` — optional pointer to the source unit that produced the Spec (Jira board, Linear team, GitHub repo).
- `title`, `description` (markdown)
- `sourceStatus` — source-native status label/key.
- `mappedStatus` — stable key from the Team source status mapping, used for filters, derived views, and badge lookup. There is no local `open | closed` Spec status enum; status changes happen through the mapped source status picker and sync back to the source system.
- `sourcePriority` — source-native priority label/key.
- `mappedPriority` — stable key from the Team source priority mapping, used for filters and badge lookup.
- `sourceDifficulty` — source-native difficulty / story-point / estimate label when available.
- `mappedDifficulty` — stable key from the Team source difficulty mapping, used for filters and badge lookup.
- `assignee` — a user (nullable = unassigned, claimable by any team member)
- `reporter`, `due`
- `sourceCycle` — source-native sprint/cycle only.
- `labels[]` — source labels with provenance (`label | epic | initiative | milestone | project | component`), used for epic/initiative/milestone-style grouping without overloading cycle/sprint.
- state flags: `justLanded` (+ `landedFrom`, `landedAgo`, `prevOwner`), `awaitingApproval`, `blockerReported`, `needsBreakdown`
- relations: `actions[]`, `comments[]`, `sourceActivity[]` (source-side event feed), `audit[]` (ownership history with time logged per owner), `linked[]` (rel = Blocks / Blocked by / Related / Implements), and the chokepoint data `blocks[]` (teammates waiting on this) / `blockedOn[]` (what this waits on, with nudge fields)

> **Backlog organization is derived, not stored (Q4).** The backlog's view tabs (Breakdown /
> In Flight / Blocked / Next Up / Completed) and a Spec's "readiness" (`no-actions →
> draft-actions → needs-estimates → ready`) are **computed** at query time from the primitives
> above — action count, whether estimates are set, `done`, blocked-ness, `assignee` — never
> persisted as columns, so they cannot drift from reality. The earlier "Later / Snoozed /
> Archive / Reassign" shelf-state framing was stale prototype-era text and does not exist in
> the built backlog.

### Action
A Stride-native **execution step** — a unit of focused work that serves Sessions, 1+ per
Spec (or standalone).
- `specId` — parent Spec, **nullable** (null = standalone personal task)
- `title`
- `estimateMin`
- `difficulty` — Stride-owned coarse difficulty (`tiny | small | medium | large`), optionally influenced by source context but not source-mapped.
- `actualMin` — accumulated from Sessions
- `done` — boolean (internally open / done; not source-mapped)
- Note: Action IDs are not globally unique in the prototype — match by `(specId, actionId)`. The real schema should give Actions their own UUID primary key.

**An Action is an execution step, not a sub-ticket.** It exists to make the *execution* of
work captureable — title, estimate, done-state, difficulty, relationship to time. It deliberately has
**no** project-management apparatus: no status workflow (open/done internally, never
source-mapped), no assignee (the Session-runner is the implicit owner), no priority of its
own (it inherits the Spec's mapped priority at display time only), no comments. Project
management lives in Jira; Stride's job is execution. This is *why* "is an Action ever 1:1
with a source issue?" dissolves as a question — Actions are a function of how work
*decomposes*, not how source tickets are *shaped*. A 1:1 Spec→Action is fine for trivial
work; a complex Spec decomposes into several. (Resolves open question Q3.)

### Session
Actual timed work against an Action. Sessions are execution/history, not planning objects. Exactly one runs at a time per user. Ephemeral while running, then archived.
- `actionId` (and via it, `specId`) — required; Sessions do not attach directly to Specs and are not standalone
- `startedAt`, `endedAt`, `elapsedMin` (ticks while running)
- on end: `feeling` (`tough` / `okay` / `good` / `on_point`, worst → best — stored as the feeling, not the frown / neutral / smile / target icon used to render it), `markDone` (whether it also closed the Action)
- the variance nudge surfaces only when `elapsedMin` ≳ 1.5–2× `action.estimateMin`
- `contentSignal?` (JSON) + `signalSource` — **nullable, unused in v1.** A reserved slot for later git/file correlation (which commits and files fell inside the Session window). It ships from day one so the timeshape→content upgrade needs **no migration**; the correlation itself is deferred to the desktop integration surface. (Resolves Q21; honors the provenance-ready commitment in `decisions.mdc` 2026-05-21.)

### Session note
A crawlable note timeline for a Session. Mid-session notes and end-of-session feedback share one shape.
- `sessionId`, `userId`, `workspaceId`
- `body`
- `source` — `manual | session_end | capture`
- `occurredAt`

> **v1 scope note (updated 2026-06-03).** Schedule block types are workspace-level
> preferences seeded with defaults; users can add, rename, reorder, recolor, or archive custom
> types. **TimeBudget was cut** rather than deferred; goals by calendar category add
> settings complexity without helping the thin execution loop. **ActionDayAssignment was
> cut entirely** when the Schedule became a single day view: every scheduled block has a
> real start time, so "intend to work on this Action today, unplaced" no longer exists as a
> concept. The ActionDayAssignment slot is kept only to record the removal.

### ScheduledEventType
A category for schedule blocks and time insights. Accounts are seeded with default types, and users can add or modify the types they use.

- `name`
- `color`, `icon`
- `systemKey?` — required/system types such as `actions` and `external_calendar`; these cannot be fully deleted
- `archivedAt?` — deletion is archive/hide-from-future-use, not destructive removal

Rules:
- Historical ScheduledEvents and Sessions retain their original type for reporting integrity.
- Required/system types remain available even if users customize the rest of their type list.
- Seeded defaults include Actions, Meeting, Break, Focus, Personal, Buffer, and External calendar.
- Custom examples include Research or Learning; the model should not assume only the seeded defaults exist.

### ScheduledEvent
A planned time block on the Schedule. ScheduledEvents are the planning layer; Sessions are the actual layer. A ScheduledEvent may point to an Action, or be a generic block.
- `typeId` — points to ScheduledEventType; external imports use the system `external_calendar` type
- `actionId?` (and via it, `specId`) — set only for action-linked blocks
- `title`
- `startAt`, `endAt`, `durationMin`
- `source` / `sourceEventId?` — set for imported external calendar events
- `availability?` — source free/busy data for external events; only busy external events reduce capacity by default
- `externalMetadata?` — opaque source metadata for imported external calendar events
- recurrence fields for Stride-owned events: RRULE string, timezone, occurrence exceptions, and occurrence overrides

External calendar events are source-owned. Stride stores them as immutable external calendar
events plus metadata needed for display/sync; renaming, recategorizing, or otherwise mutating
their source identity happens outside Stride.

Rules:
- Action-linked ScheduledEvents are **non-recurring**.
- Generic Stride-owned ScheduledEvents may recur and support edit scopes: this occurrence only, this and future, entire series.
- External events are source-owned in Stride; editability is derived from external provenance (`source`, `sourceEventId`, `externalMetadata`) rather than a separate fixed flag.
- A single Action may have multiple ScheduledEvents.
- ScheduledEvent duration does not mutate `Action.estimateMin`.

### ActionDayAssignment — removed 2026-05-21
**Cut entirely.** This was an untimed intent to work on an Action on a specific day, used
by the (now removed) week overview and the tray before exact time placement. The Schedule
simplification — a single day view where every block has a real start time — removed the
concept. Untimed day-level intent now lives as **ordering in the Backlog**, not as a
schedule entity. This slot is kept only so the removal is traceable.

### User / membership
Not modeled in the prototype (it keys everything on a display name and maps names → avatar colors). The real model needs: User, a Workspace Membership with a workspace-scoped `role` (`member | admin`), and Team Membership rows with a team-scoped `role` (`member | admin`). Workspace admin and team admin are independent scoped permissions; a person can have either or both through separate rows. Auth is Better Auth; tenant isolation is Postgres RLS via session context.

Personal settings split by scope:
- Account-wide settings: identity, appearance, global notification defaults, personal OAuth accounts, privacy preferences.
- Per-workspace personal settings: calendar opt-in, workspace notification overrides, tracking preferences, and working hours.

Default working hours are seeded from the Team when a member joins a team, but the member ultimately has one personal working-hours setting per Workspace. If a member joins multiple teams in one Workspace, the calendar/capacity surface uses the member's workspace-level hours, not separate team-level hours.

Onboarding is **account-first** (Q11): a User account is created first, then workspace creation mints the Workspace + the founder's workspace Membership (`admin`). Invite acceptance is a magic link that mints a workspace Membership (`member`) and drops the invitee inside the workspace. There is no standalone signup surface; `/auth/login` serves returning users.

### Workspace
The tenant root for data isolation and Workspace Admin settings.

Workspace General stores exactly the settings the Workspace Admin UI exposes:
- `name` — workspace display name.
- `slug` — workspace address subdomain.
- `logoUrl` — optional workspace logo.
- `plan` — product plan preview/entitlement marker.
- `invitePermission` — workspace admins only, workspace and team admins, or all members.
- `grantTeamAdminPermission` — workspace admins only, or workspace and team admins.
- `sourceRequestPermission` — workspace admins only, team admins, or any member.
- `unmappedSourceUnitBehavior` — send unmapped source units to admin review or Inbox.
- `crossTeamMoveReviewer` — destination team admin or workspace admin.
- `awaitingApprovalDestination` — Backlog attention or Inbox.

Workspace General does not store personal workspace preferences such as working hours, calendar opt-in, notification overrides, tracking preferences, working mode, presence, or focus status. Those live on the user or workspace membership.

### Team
A Stride Team is the source-sync boundary inside a Workspace and the scope for Team Admin settings.

Team General stores exactly the settings the Team Admin UI exposes:
- `name` — Stride team name.
- `newSpecDestination` — where newly synced source issues land: Needs breakdown, team inbox, or ready to schedule.
- `triageOwner` — who is expected to decide whether a new spec is ready or needs breakdown: team admins, source assignee, or unassigned.
- `missingEstimatesBehavior` — ask during breakdown, allow empty estimates, or mark needs review.
- `unassignedWorkBehavior` — send unassigned source work to team inbox, send to Needs breakdown, or hide until assigned.
- `readyToScheduleRule` — has at least one action, has estimate and action, or Team admin marks ready.
- `staleBreakdownNudge` — off, after 3 workdays, or after 5 workdays.

Team General does **not** store source-owned identifiers, source-to-team assignment, member working hours, working mode, notification timing, presence, or focus status. Source-owned identifiers and mappings live in Team Source mapping; personal defaults stay on the user/workspace membership.

### Source connection
Not modeled in the prototype. The real model needs a workspace-owned connection pool per source account. A Workspace Admin can manage all connections in the pool. A Team Admin can add a source connection from Team settings without broad workspace-admin access; that connection still becomes visible in the Workspace's connection pool.

Credentials/tokens live on the pooled Workspace connection. The connection row stores typed provider metadata: Jira cloud/site, Linear organization, or GitHub installation/account metadata.

### Source unit
A syncable unit discovered through a connection: a Jira board, Linear Team, or GitHub repository. Source units store provider-specific metadata needed for deep links and sync (for example Jira board/project ids, Linear team id/key, or GitHub owner/repo/installation context).

A Team has exactly one primary source mapping in v1, selected from `source_units`. Each source unit can map to only one Stride Team per Workspace. Status, priority, and difficulty mappings belong to the Team ↔ source unit mapping, not to the pooled connection, because workflows differ per board/team/repo. Each mapping keeps the source key/label separate from the Stride mapped badge metadata (`mappedKey`, display mode, text or icon, and color). If all source units available through a connection are already claimed, the settings UI should say there are no unmapped units left.

Calendar connections are personal, not workspace-pooled. A user may authorize a calendar account once and opt into using it per Workspace, choosing which calendar applies during workspace onboarding or later in My workspace settings.

### Deferred infrastructure
Offline mutation processing is post-MVP. The `processed_mutations` idempotency ledger returns with the full offline queue implementation rather than shipping as an unused table.

## Source-sync boundaries

| Source | Source unit maps to | Project/grouping metadata |
|---|---|---|
| Jira (free / team-managed) | Space/board | Epic/project labels |
| Jira (paid / company-managed) | Board within a Space | Epic/project labels |
| Linear | Team | Project/initiative labels |
| GitHub | Repository | Milestone/project labels |

- Status/priority/difficulty mapping is defined in Team Source mapping (admin maps the source values to Stride badge metadata); the raw source values remain source-owned.
- Sync path: source webhook → Cloudflare Queue → consumer Worker → Neon. A CF Cron Trigger polls Jira periodically as a fallback (Jira webhooks are best-effort, no replay).
- Stride creates issues in a source system **only** during spec-splitting in the breakdown flow. Stride never creates Jira Spaces, Linear Teams, or GitHub Repos.

## Planning, actuals, and capacity

Schedule has two layers:
- **Plan** — ScheduledEvents. The tray lists Actions still to place.
- **Actual** — Sessions.

Plan and Actual can be compared visually, but they remain distinct model concepts. In Plan mode, ScheduledEvents are active/editable and Sessions may be shown as click-through context. In Actual mode, Sessions are active/editable and ScheduledEvents may be shown as click-through context. The Plan/Actual comparison is a **session-first** affordance; in schedule-first mode there is only the Plan layer.

Time accounting follows the user's **Working mode** — a personal, account-level setting, not a team default and with no admin override gate (see [`overview.md`](overview.md) → User modes and [`principles.md`](principles.md)):
- **Schedule-first (planned-time)** — planned schedule time counts toward time spent as the day plays out.
- **Session-first (explicit sessions)** — the schedule is a guide; recorded Sessions are the source of truth for actual time.

Insights follow the selected accounting mode. The `actions` schedule type is accounted for like any other type; action-linked details do not create a separate rule.

Remaining time for the scheduling tray:

```
remaining = estimateMin - completedSessionMin - futureScheduledActionEventMin
```

Clamp remaining at zero for the primary display. Past planned time does not count unless it produced actual Session time. Overplanned Actions may be shown as quiet context, but not as an error.

Daily capacity:
- Base capacity is configured working hours.
- Off-hours are schedulable but do not inflate normal capacity.
- External busy events, meetings, breaks, personal blocks, and buffers reduce available capacity.
- Action-linked ScheduledEvents and focus blocks count as planned work.
- External events marked free/available by the source do not reduce capacity unless locally classified otherwise.

## Source-native storage

Source-specific fields — Jira's Sprint, Linear's Cycle, GitHub's Milestone, and any
source-specific custom fields — are stored **source-native** (in source-specific columns
or JSON blobs), not normalized into a unified Stride schema. Stride does **not** have its
own Project/Sprint entity that flattens the three sources together.

Normalization happens at the **display layer, not the data layer**: the UI has a unified
slot for "the source's grouping concept" that renders "Sprint 24" or "Cycle 12" depending
on what the source called it. A Spec is "a source item the user is actively engaging
with"; the hierarchy above it is *displayed* but not *modeled* as Stride entities.

The cost is harder cross-source queries — deferred, and cheap to add later if real demand
appears. The gain is adaptability to each source's vocabulary without configurability, and
no schema churn when a fourth source is added.

## Cross-cutting entity attachment point (forward-looking)

A future **Concept** entity — features, modules, customer segments, recurring problem
patterns — may need to attach to *any* Stride entity (a Spec, an Action, a Session, a
Capture). To preserve that option without building it now, v1 includes a single empty
**junction table** in which any entity can participate (`entity_type` + `entity_id` ↔
`concept_id`).

Not populated in v1, not surfaced anywhere. It exists only so the future-state option
(cross-cutting concepts, and eventually corpus integration) stays open at near-zero cost.
Adding the table now is trivial; retrofitting cross-cutting attachment onto a mature
schema is not.

## Open model questions

Tracked in [`open-questions.md`](open-questions.md): How are labels/tags grouped ("feature within a project")? Default teammate visibility (load-only vs full Today)? Final DB representation for ScheduledEvent recurrence/exceptions still needs schema design. *(Q3 resolved 2026-05-21 — see the Action entity above. Q4 "shelf states", Q8 reopen, and Q21 in-session content signal all resolved 2026-06-02 — see the Spec, Session, and backlog-organization notes above.)*
