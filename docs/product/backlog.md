---
title: Backlog — product and design brief
updated: 2026-05-14
status: current
owner: jaren
---

# Backlog

The Backlog is where synced source tickets become executable work. It should feel like a calm triage desk, not another issue tracker. The user comes here to find the most important open spec, break it into actions, and schedule or start the next action.

Backlog also supports a team refinement workflow. A team can use it as the place where synced specs are collaboratively broken into concrete actions, replacing or tightening a traditional backlog refinement meeting. The cohesive product context and canonical spec still live in Jira or Linear; Stride adds the execution layer: action breakdown, estimates, ownership, blockers, and scheduling readiness. This workflow is optional. Some teams will use Backlog collaboratively; many users will only use it to plan and track their own assigned tickets.

This brief is written for production implementation and `$impeccable live` iteration. The Claude Design prototype in `../../../claude-design-files/stride/project/app/Backlog.jsx` is a UX reference only. Preserve the flows and edge cases; do not copy its visual style, inline styles, or component structure.

## Product job

Backlog answers four questions:

1. **What needs breakdown before work can start?** Specs with no actions, unclear scope, or an explicit needs-breakdown flag.
2. **What is ready to schedule or start?** Specs with one or more open actions and enough estimate/detail to plan.
3. **What needs attention?** Approval waits, source/status drift, blockers, unassigned work, and chokepoints.
4. **Where should the team collaborate on execution shape?** Specs that need shared action breakdown, estimate discussion, ownership, dependency clarification, or readiness agreement.

The page should make progress feel possible. It should reduce the feeling of a large ticket pile into a short set of next moves, while still giving teams a shared place to turn ambiguous specs into actionable work.

## Primary users

- **Individual contributor:** finds their work, breaks down specs, starts or schedules actions, notices blockers. May work privately or join a team breakdown pass.
- **Team admin:** sees the same work surface plus approval/unblock context. Admin powers are additive, not a separate mode. May facilitate refinement by sorting, assigning, and confirming readiness.
- **Workspace admin:** can inspect cross-team edge cases, but the default experience still starts with work execution.
- **Multi-team member:** needs a clear team/workspace scope and a way to include all teams without losing focus.

## Routes and view state

Canonical route: `/backlog`.

Backlog has in-page views, not child routes:

- `?view=ready` — default. Work that can be started or scheduled now.
- `?view=breakdown` — specs that need action shape, estimates, or ownership.
- `?view=waiting` — blocked work and cross-team/source waits.
- `?view=all` — all work in the current team scope.
- Actions are a lens inside these views, not necessarily a peer top-level tab.

Inbox is a separate page (`/inbox`) for newly synced specs, handoffs, and unmapped source items before they become backlog planning work. Blockers are not a peer top-level view with Specs and Actions. They are an attention/workflow lens surfaced through filters, chips, and a focused coordination section when needed.

Optional in-page state:

- `assignee=mine | unassigned | userId | all`
- `priority=...`
- `sprint=...`
- search query

## Information architecture

### Header

Must include:

- Page title: `Backlog`
- Short page purpose, not a marketing sentence
- View toggle: Specs / Actions
- Total visible count, quiet and secondary
- Blocked count or filter as supporting context, not a primary navigation tab

Avoid duplicating the left rail navigation. Avoid a huge dashboard hero. Backlog is an operating surface.

### Controls

Must include:

- Search by title, source key, label
- Priority filter
- Assignee filter: Mine, Unassigned, Everyone, named teammates
- Sprint filter
Controls should be easy to scan but not dominate the page. Active filters must be obvious and removable. Density preference belongs in app settings, not in the Backlog page controls.

### Recommended work

Surface the top ~3 urgent items before the full list. This is not a generic card grid. Each recommendation should explain why it is recommended:

- P1/P2 priority
- assigned to me
- just landed
- blocked teammate waiting
- missing breakdown
- ready action with near-term schedule fit

Each recommended item should have one primary action:

- `Break down` for specs without actions
- `Start session` for ready actions
- `Schedule` when not planned
- `Review approval` for approval waits

### Specs view

Two main groups:

1. **Needs breakdown**
   - Specs with no actions or `needsBreakdown`
   - Primary action: Break down
   - Shows source, source key, priority, assignee, sprint, attention chips
   - If unassigned, make `Claim` available without making it noisy

2. **Ready to schedule**
   - Specs with actions
   - Shows progress: done actions / total actions
   - Shows time accounting: estimated, logged, planned, unaccounted
   - Shows next open action
   - Primary action: Start or Schedule next action

A spec row/card must be clickable to open the spec view. The quick action should not fight the click target.

For collaborative refinement, Needs breakdown should also support a meeting-like pass where the team can move spec-by-spec through unresolved work. This does not need to be a separate route at first, but the design should leave room for a focused breakdown mode or selected-spec panel. The important behavior: participants can discuss the source spec, create/edit/reorder actions, add estimates, clarify owners, and mark the spec ready to schedule without losing the surrounding backlog context.

### Actions view

A flat, priority-ranked list of every open action across visible specs.

Each action row should show:

- Action title
- Parent spec title and source key
- Priority inherited from parent spec
- Assignee
- Estimate
- Logged time
- Planned time
- Unaccounted time
- State: open, scheduled, in progress, done

Primary actions:

- Start session
- Schedule
- Mark done

The time accounting line matters. It is the reason this is not just a task list.

### Blockers lens

Blockers should be available as a focused lens or filter, not as a peer tab beside Specs and Actions.

When active, it should expose two sections:

1. **Waiting on others**
   - Specs/actions blocked by someone else
   - Show who/what is blocking, how long it has waited, and whether a nudge has already been sent
   - Primary action: Nudge or Open spec

2. **Chokepoints**
   - Specs/actions owned by the current user that block teammates
   - Rank by number of people waiting, priority, and age
   - Must feel helpful, not accusatory
   - Primary action: Open, Start, or Respond

## Collaborative refinement

Backlog can be used in two modes without making users choose a product mode up front:

- **Personal planning:** default for many ICs. Filter to Mine, inspect assigned specs, break down personal work, schedule actions.
- **Team refinement:** a team works through incoming or ambiguous specs together and turns them into actions.

Team refinement should preserve these principles:

- Jira or Linear remains the source of truth for the spec narrative, acceptance criteria, comments, and source status.
- Stride owns execution breakdown: actions, estimates, action ownership, blockers/dependencies, sessions, and schedule readiness.
- The team should be able to collaborate without creating duplicate specs in Stride.
- A simple spec can become one action. Complex specs can become many actions.
- The UI should show when a spec is not ready, partly broken down, or ready to schedule.
- The experience should not require everyone to use Stride the same way. A team can refine collaboratively while an individual still uses Backlog mostly as a personal planning queue.

Design affordances to consider during iteration:

- `Needs breakdown` as a shared queue for refinement.
- A focused selected-spec panel for breaking down actions while keeping the queue visible.
- Clear readiness state: No actions, Draft actions, Needs estimates, Ready to schedule.
- Lightweight collaboration cues: who is assigned, who last edited, pending approval, blocked by dependency.
- Team-scoped filters and all-teams context for admins or multi-team members.
- A strong path from `Break down` to `Ready to schedule`, not a modal dead end.

## Attention chips

Use inline chips, not a separate alerts page.

Required chips:

- **Awaiting approval** — reassignment or cross-team transfer is waiting. Work likely should not move until granted.
- **Closed in source · still open here** — source says done/closed, but Stride still has open actions. User must resolve: close remaining actions, reopen source, or keep as Stride-only follow-up if allowed.
- **Blocker reported** — this spec is blocked or is blocking someone.
- **Unassigned · claim** — no assignee; user can claim if appropriate.
- **Just landed** — newly assigned or recently transferred spec.

Chips should be concise. They must not turn every row into a warning banner.

## Source vocabulary

Stride stores internal normalized status/priority but displays source vocabulary everywhere.

Examples:

| Source | Priority display | Status display |
|---|---|---|
| Jira | Highest, High, Medium, Low, Lowest | To Do, In Progress, In Review, Blocked, Done |
| Linear | Urgent, High, Medium, Low, No priority | Backlog, Todo, In Progress, In Review, Done, Cancelled |
| GitHub (future) | Critical, High, Medium, Low | Open, Draft, Ready for review, Merged, Closed |

Do not show a generic `Done` button as the only status affordance. Spec detail gets the full source-mapped status picker; Backlog can show the current source status quietly.

## Edge cases to design for

### Source closed, Stride actions open

A synced source issue is marked closed while Stride still has open actions.

Backlog behavior:

- Show `Closed in source · still open here`
- Keep it visible until resolved
- Do not silently close actions
- Offer resolution from the spec view

### Cross-team reassignment approval

A member requests a spec/action transfer to another team. It should not move until approved.

Backlog behavior:

- Keep the item in its current team context
- Show `Awaiting approval`
- Show who/which team approval is waiting on when space allows
- Admins can approve/decline from the spec view or approval surface

### User belongs to many teams

Default should be focused, not global chaos.

Backlog behavior:

- Show current workspace/team scope in the app shell
- Support an all-teams merged view later, but make the selected scope obvious
- In merged contexts, every row needs a team/source cue

### Linear team has no Stride team

An unmapped source entity appears during sync.

Backlog behavior:

- Do not drop the work silently
- Route it to an admin setup/triage state
- Show enough context to map or ignore it
- Normal members should not be burdened with configuration unless they are the first affected user

### Missing estimate at schedule time

An action without an estimate cannot be scheduled cleanly.

Backlog behavior:

- Allow quick estimate entry inline or in the scheduling flow
- Do not block breakdown completion just because every estimate is not perfect
- Ask at the moment estimate is needed

### Duration variance

A live or completed session runs ~1.5–2× over estimate.

Backlog behavior:

- Do not nag from the Backlog list
- Show variance in action/spec time accounting
- The nudge belongs in session end / Today / Tray

## Visual direction for iteration

Physical scene: an IC reviews the backlog mid-morning on a laptop before choosing what to work on next; the room is bright, the user wants clarity and momentum, not a dark command center.

Use a **light main workspace with a dark left rail** unless a later design decision changes this. The Backlog surface should be calm, precise, and slightly rewarding when work becomes ready.

Guidelines:

- Prefer lists, grouped lanes, and progressive disclosure over card grids.
- Use cards only for the top recommendations or when a boundary carries meaning.
- Avoid nested cards.
- Keep source metadata quiet: source key, source, sprint, labels should not dominate titles.
- Use color sparingly for priority, attention, and positive progress.
- Keep Backlog's default density minimal and scannable. Any global compact/comfy preference belongs in app settings.
- The page should not look like Jira, Linear, or a generic SaaS dashboard.
- No surveillance framing. Chokepoints should read as coordination help, not blame.

## Copy principles

- Use verbs for actions: Break down, Start, Schedule, Claim, Nudge, Review.
- Avoid corporate status prose.
- Avoid celebratory language for normal chores.
- Avoid em dashes.
- Prefer `Needs breakdown` over `Inbox` for the group name.
- Prefer `Ready to schedule` over `Refined` for the group name.

## Mock data requirements

A useful design playground should include at least:

- 12–18 open specs
- 4 specs needing breakdown
- 2 specs in partially broken-down draft state
- 6 specs ready to schedule
- 2 closed-in-source conflicts
- 2 awaiting approval items
- 2 blocker cases
- 2 unassigned specs
- Jira and Linear examples
- Multiple priorities and sprints
- Several actions with estimated/logged/planned/unaccounted time
- At least one spec with all actions done but source still open
- At least one spec with source closed but actions open
- At least one spec that looks like a team-refinement candidate: ambiguous source scope, no actions, multiple possible owners
- At least one spec that has collaboratively drafted actions but missing estimates

## Implementation notes

- Route data can be mocked until the API shape stabilizes.
- Start with route-level components under `apps/web/src/components/backlog/`.
- Promote stable atoms/molecules to `packages/ui` after the page proves the pattern.
- Keep visible text ready for i18n even if the first prototype uses local strings.
- Data fetching eventually belongs in route loaders/query hooks, not UI components.
