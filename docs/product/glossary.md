---
title: Glossary
updated: 2026-05-19
status: draft
owner: jaren
---

# Glossary

The vocabulary, pinned. Terminology churned a lot during design; these are the landed terms. When in doubt, this file wins.

| Term | Meaning | Notes / history |
|---|---|---|
| **Spec** | A ticket synced from a source system (Jira / Linear / GitHub). Has ≥ 1 Action before work can begin. | There are **no** Stride-native specs. Was called "Item" / "Inbox item". |
| **Action** | A Stride-native unit of work; 1+ per Spec. Title + estimate; gains done-state and actual time. | Was "Step". Action IDs are not globally unique — match by (specId, actionId). Whether an Action is ever 1:1 with a source issue: see [`open-questions.md`](open-questions.md). |
| **Standalone Action** | An Action with no parent Spec — a lightweight personal task (title + estimate only). | Personal; never appears in the team's shared backlog. |
| **Session** | A timed work block run against an Action. One at a time. Ends with a feeling check-in (icons: frown / neutral / smile / target) + optional note + mark-done-or-keep-open. | Variance nudge appears only at ~1.5–2× over estimate — deliberately gentle. "Pause" was removed; single "End session" button. |
| **Break down** | Splitting a Spec into Actions, with an inline AI-assist panel in the Spec modal's Overview tab. | Was "Refine" (and a standalone page) — now inline. **Never** "Triage" (the user dislikes the term). |
| **Source** / **source system** | Jira, Linear, or GitHub. Stride displays each source's own priority and status vocabulary; the mapping from Stride's internal states is set when the source is connected. | GitHub eventually sends issues + PRs in (configured per-connection) — future. |
| **Workspace** | The top-level tenant. Can be **solo** (one person) or a **team** with roles. | Tenant isolation is enforced server-side (Postgres RLS). |
| **Team** | Maps to a Jira board (within a Space) / Linear Team / GitHub Repository. A workspace can have multiple teams; an "all teams" merged view exists. | An unmapped source team prompts "merge with existing" or "create new". |
| **Project** | *Optional* grouping. Maps to a Jira Epic / Linear Project / GitHub Milestone. Issues without one appear uncategorized — never hidden. | |
| **Role** | Additive permission tier: **Member ⊂ Team Admin ⊂ Workspace Admin**. | Admins see the same task views as members, plus approve/edit and transfer-approval. Unassigned specs/actions can be claimed by any team member. |
| **Schedule block / entry** | An item placed on the Schedule calendar. Each block has a schedule event type/category, such as Actions, Meetings, Focus, Break, Personal, Buffer, Research, or Learning. | Types are no longer assumed to be a hard-coded-only set. Accounts are seeded with defaults; users can add/archive/modify usable types, while required system types such as Actions remain available. |
| **Schedule event type** | A category for planned or actual calendar time. Used for block styling, filtering, capacity/budget reporting, and insights. | Deleting a type means archiving/hiding it from future use; historical blocks/sessions keep their type for accurate reporting. |
| **Time budget** | An optional goal for how much time a user wants to spend in selected schedule event types. | One active budget mode at a time: daily or weekly. Budgets are duration-based targets, not hard constraints. Unbudgeted types can still appear in insights. |
| **Time-accounting mode** | Preference for how Stride treats planned schedule time versus recorded sessions. | **Planned-time / YOLO mode:** planned blocks count as time spent as the day plays out. **Explicit sessions mode:** the plan is a guide; recorded Sessions are the source of truth. Budget reporting follows the same accounting mode. |
| **Info Hub** | The configurable right-rail of widgets on the **Today** screen — the user picks which show and in what order (just-landed, mentions, blockers, blocking, day stats, variance nudge, week streak, teammate pulse, upcoming meetings, focus mode). | Note: the full timeline does **not** live on Today — it's on Schedule. |
| **Tray** | The desktop menu-bar window — a compact cockpit mirroring the web app. States: idle / live-session (arc dial) / break / meeting prompt; plus a ⌥Space capture popover. | One Tauri binary, two windows — the tray is the same web build at `/tray`. The OS handles notifications; the tray's top banner appears only for time-sensitive context. |
| **Capture** | A quick note: either an *Insight* or a *Next* item. Invoked by ⌥Space. Attaches to the running session if there is one, else drops into the backlog. | The only in-flow capture; in-session prompts were removed in favor of the post-session feeling check-in. |
| **Nudge** | A gentle prompt to a teammate you're waiting on (and the inbound version: nudges from people waiting on you, in a "nudge inbox"). | |
| **Needs attention** | Inline status chips, surfaced in Backlog rather than as a separate page: *Awaiting approval*, *Closed in source · still open here*, *Blocker reported*, *Unassigned · claim*. | A cross-team reassignment shows an "awaiting approval" state until an admin approves the transfer. |

## Banned / discouraged terms

- **"Triage"** — never. (Repeatedly rejected.)
- **"Shipped"** as a metric label — use **"specs closed"** / **"PRs merged"**.
- Emoji-as-UI — use icons.
- Old names that should not resurface in product copy: "Item", "Inbox", "Step", "Refine" (as a page), "Calendar" (it's "Schedule").
