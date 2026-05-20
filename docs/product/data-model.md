---
title: Data model (conceptual)
updated: 2026-05-19
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
  ├── ScheduledEvent        planned time block; may point to an Action or be generic/external
  ├── TimeBudget            optional duration goals for selected ScheduledEventTypes
  └── ActionDayAssignment   untimed intent to work on an Action on a specific day

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
- `title`, `description` (markdown)
- `priority` — internal scale, **displayed using the source's vocabulary** (Jira: Highest…Lowest; Linear: Urgent…No priority; GitHub: Critical…Low)
- `status` — internal `open | closed`, **displayed using the source's vocabulary**; `CLOSED_STATUSES` ≈ Done / Cancelled / Merged / Closed
- `assignee` — a user (nullable = unassigned, claimable by any team member)
- `reporter`, `due`, `sprint`, `labels[]`
- state flags: `justLanded` (+ `landedFrom`, `landedAgo`, `prevOwner`), `awaitingApproval`, `blockerReported`, `needsBreakdown`
- relations: `actions[]`, `comments[]`, `sourceActivity[]` (source-side event feed), `audit[]` (ownership history with time logged per owner), `linked[]` (rel = Blocks / Blocked by / Related / Implements), and the chokepoint data `blocks[]` (teammates waiting on this) / `blockedOn[]` (what this waits on, with nudge fields)

### Action
A Stride-native unit of work, 1+ per Spec (or standalone).
- `specId` — parent Spec, **nullable** (null = standalone personal task)
- `title`
- `estimateMin`
- `actualMin` — accumulated from Sessions
- `done` — boolean
- `assignee` — a user
- Note: Action IDs are not globally unique in the prototype — match by `(specId, actionId)`. The real schema should give Actions their own UUID primary key.

### Session
Actual timed work against an Action. Sessions are execution/history, not planning objects. Exactly one runs at a time per user. Ephemeral while running, then archived.
- `actionId` (and via it, `specId`) — required; Sessions do not attach directly to Specs and are not standalone
- `startedAt`, `endedAt`, `elapsedMin` (ticks while running)
- `notes` + `jots[]` — quick mid-session notes `{ at, text, kind }`
- on end: `feeling` (icons: frown / neutral / smile / target), `note` (optional free text), `markDone` (whether it also closed the Action)
- the variance nudge surfaces only when `elapsedMin` ≳ 1.5–2× `action.estimateMin`

### ScheduledEventType
A category for schedule blocks and time insights. Accounts are seeded with default types, and users can add or modify the types they use.
- `name`
- `color`, `icon`
- `systemKey?` — required/system types such as `actions`; these cannot be fully deleted
- `archivedAt?` — deletion is archive/hide-from-future-use, not destructive removal

Rules:
- Historical ScheduledEvents and Sessions retain their original type for reporting integrity.
- Required/system types remain available even if users customize the rest of their type list.
- Custom examples include Research or Learning; the model should not assume only the seeded defaults exist.

### ScheduledEvent
A planned time block on the Schedule. ScheduledEvents are the planning layer; Sessions are the actual layer. A ScheduledEvent may point to an Action, or be a generic block.
- `typeId` — points to ScheduledEventType; seeded examples include actions, meeting, break, focus, personal, buffer, external
- `actionId?` (and via it, `specId`) — set only for action-linked blocks
- `title`
- `startAt`, `endAt`, `durationMin`
- `source` / `sourceEventId?` — set for imported external calendar events
- `availability?` — source free/busy data for external events; only busy external events reduce capacity by default
- `externalClassification?` — local Stride override for source-owned external events: `meeting | break | focus | personal | buffer`; time/title/source remain immutable
- recurrence fields for Stride-owned generic events: RRULE-style rule, timezone, end condition, occurrence exceptions, and occurrence overrides

Rules:
- Action-linked ScheduledEvents are **non-recurring**.
- Generic Stride-owned ScheduledEvents may recur and support edit scopes: this occurrence only, this and future, entire series.
- External events are source-owned and fixed in Stride. They can be locally classified. For recurring external events, applying a classification to the series means this and future occurrences only.
- A single Action may have multiple ScheduledEvents.
- ScheduledEvent duration does not mutate `Action.estimateMin`.

### TimeBudget
An optional goal for how much time a user wants to spend in selected ScheduledEventTypes. Budgets are planning/insight targets, not blockers.
- `period` — `daily | weekly`; a user has one active budget mode at a time
- `totalMin` — optional total time commitment for the active period, e.g. 8h/day or 40h/week
- `targets[]` — `{ typeId, durationMin, direction, tolerance? }` for only the types the user chooses to budget
- `direction` — `atMost | atLeast | target`; caps, floors, and intended allocations need different feedback
- `effectiveFrom`, `effectiveTo?` — backend can preserve budget history even if the first frontend mostly shows current/future impact

Rules:
- Targets are duration-based, not percentage-based inputs.
- Budget targets are always private and visible only to the individual user. They do not appear in Team/Org insights, even aggregated, for now.
- Unbudgeted types still appear in insights as unbudgeted planned/actual time.
- Switching daily ↔ weekly may auto-convert values, but the exact UX is deferred.
- Category targets may also be represented as percentages of `totalMin`; persisted targets should retain duration for aggregation, while UI may display percentage allocation.
- `target` budgets use a tolerance band for on-track status, defaulting around ±10% unless configured otherwise later.
- `atMost` and `atLeast` budgets can use quiet warning thresholds before a limit is missed; weekly budgets use elapsed-period pacing for soft feedback.
- Budget reporting uses the same planned-vs-actual source-of-truth behavior as the user's time-accounting mode and the active Schedule view.
- If a referenced ScheduledEventType is archived, historical budget records keep the reference, but active budget editing hides/removes that target going forward.

### ActionDayAssignment
Untimed intent to work on an Action on a specific day. This is used by the week planning overview and scheduling tray before exact time placement.
- `actionId`
- `date`
- `userId`

Rules:
- Assignments are day-specific, not week-level.
- Dragging an Action onto a week day creates or updates an ActionDayAssignment.
- Dragging an Action-linked timed block to another day in week view removes the exact time and creates an ActionDayAssignment for the target day.
- A timed ScheduledEvent is created only when work is placed on the day canvas.

### User / membership
Not modeled in the prototype (it keys everything on a display name and maps names → avatar colors). The real model needs: User, and a Membership joining User × Workspace (and User × Team) with a `role` (Member / Team Admin / Workspace Admin — additive). Auth is Better Auth; tenant isolation is Postgres RLS via session context.

### Source connection
Not modeled in the prototype. The real model needs a Connection per (Workspace, source) holding: credentials/tokens, which Jira Spaces/boards or Linear Teams or GitHub Repos are mapped to which Stride Teams, the status/priority mapping chosen at connection time, and webhook/cron sync state. (GitHub may later send PRs in addition to issues — configured here.)

### Infrastructure tables (from `db-patterns.mdc`)
- `processed_mutations` — `{ id (client UUID from the mutation command), result (JSON), processedAt }`. The offline mutation queue checks this before re-executing a command; no soft delete; pruned by age via a CF Cron job.

## Source-sync boundaries

| Source | "Team" maps to | "Project" (optional) maps to |
|---|---|---|
| Jira (free / team-managed) | Space — one board per space | Epic |
| Jira (paid / company-managed) | Board within a Space | Epic |
| Linear | Team | Linear Project |
| GitHub | Repository | Milestone |

- Status/priority mapping is defined **at connection time** (admin maps the source's custom states to Stride's internal states); the UI always displays the source's vocabulary.
- Sync path: source webhook → Cloudflare Queue → consumer Worker → Neon. A CF Cron Trigger polls Jira periodically as a fallback (Jira webhooks are best-effort, no replay).
- Stride creates issues in a source system **only** during spec-splitting in the breakdown flow. Stride never creates Jira Spaces, Linear Teams, or GitHub Repos.

## Planning, actuals, and capacity

Schedule has two layers:
- **Plan** — ScheduledEvents plus ActionDayAssignments in the tray.
- **Actual** — Sessions.

Plan and Actual can be compared visually, but they remain distinct model concepts. In Plan mode, ScheduledEvents are active/editable and Sessions may be shown as click-through context. In Actual mode, Sessions are active/editable and ScheduledEvents may be shown as click-through context.

Time accounting is a team-default preference with optional individual override if the team allows it:
- **Planned-time / YOLO mode** — when the user plans blocks and the day plays out, planned schedule time automatically counts toward time spent.
- **Explicit sessions mode** — the schedule is a guide; recorded Sessions are the source of truth for actual time.

Budgets and insights follow the selected accounting mode. The `actions` schedule type is budgeted/accounted for like any other type; action-linked details do not create a separate budget rule.

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

## Open model questions

Tracked in [`open-questions.md`](open-questions.md): is an Action ever genuinely 1:1 with a source issue (or always strictly smaller)? Do "Later" / "Snoozed" / "Archive" collapse to fewer states? How are labels/tags grouped ("feature within a project")? Default teammate visibility (load-only vs full Today)? Final DB representation for ScheduledEvent recurrence/exceptions and ActionDayAssignment still needs schema design.
