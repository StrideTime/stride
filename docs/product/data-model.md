---
title: Data model (conceptual)
updated: 2026-05-12
status: draft
owner: jaren
---

# Data model — conceptual

The shape of the domain. This is the *conceptual* model for product reasoning — the **authoritative database schema** lives in `packages/db` (Drizzle + drizzle-zod) and its conventions in [`.cursor/rules/db-patterns.mdc`](../.cursor/rules/db-patterns.mdc); the core-model rules (and source-sync boundaries) are in [`.cursor/rules/architecture.mdc`](../.cursor/rules/architecture.mdc). When this doc and the schema disagree, the schema is reality and this doc is the bug.

## Core hierarchy

```
Workspace (tenant — solo or team; RLS-isolated)
  └── Team           maps to a Jira board / Linear Team / GitHub Repository
        └── Project  optional — maps to a Jira Epic / Linear Project / GitHub Milestone
              └── Spec      synced from the source system; never Stride-native
                    └── Action   Stride-native; 1+ per Spec
                          └── Session   a timed work block on an Action

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
A timed work block against an Action. Exactly one runs at a time per user. Ephemeral while running, then archived.
- `actionId` (and via it, `specId`)
- `startedAt`, `endedAt`, `elapsedMin` (ticks while running)
- `notes` + `jots[]` — quick mid-session notes `{ at, text, kind }`
- on end: `feeling` (icons: frown / neutral / smile / target), `note` (optional free text), `markDone` (whether it also closed the Action)
- the variance nudge surfaces only when `elapsedMin` ≳ 1.5–2× `action.estimateMin`

### Schedule entry (calendar block)
An item placed on the Schedule.
- `kind` — `action | meeting | focus | break` (the `BLOCK_KINDS` registry: `action`=accent/play, `meeting`=violet/two-users, `focus`=ink/shield protected deep-work, `break`=green/coffee)
- `specId?`, `actionId?` — set for `kind: action` blocks
- `title`
- `dayOffset`, `startMin` (minutes from a day baseline), `durMin`
- `status?` (`open | inProgress | done`), `actualMin?` (for plan-vs-actual display)

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

## Open model questions

Tracked in [`open-questions.md`](open-questions.md): is an Action ever genuinely 1:1 with a source issue (or always strictly smaller)? Do "Later" / "Snoozed" / "Archive" collapse to fewer states? How are labels/tags grouped ("feature within a project")? Default teammate visibility (load-only vs full Today)?
