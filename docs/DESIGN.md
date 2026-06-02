---
title: Design system
updated: 2026-05-14
status: draft
owner: impeccable
---

# Design system

This is the working design brief for Stride while the production component system is being built. It exists to guide implementation and `$impeccable live` iteration. The Claude Design prototype is a UX and flow reference, not a visual source of truth.

## Product register

Stride is product UI. Design serves daily work execution. It should be useful, calm, and rewarding because progress is real, not because the interface is playful.

## Visual personality

Minimal, useful, rewarding.

- **Minimal:** only show fields that help the user decide, plan, unblock, or celebrate actual completion.
- **Useful:** every visible metric should support an action or a decision.
- **Rewarding:** progress states should feel satisfying through clarity, motion, and proportion, not gamification.

Avoid:

- Jira-like density and configuration chrome
- generic SaaS dashboards
- surveillance dashboards
- cartoon gamification
- dark-mode-by-default command centers

## Theme

Default app scene: an IC is checking the day and backlog on a laptop during a focused work block, often alongside their source tracker and editor. A dark professional workspace reduces glare and keeps attention on execution state.

Use:

- Dark main workspace as the current default
- Darker left rail for app navigation and workspace/team context
- Light theme tokens remain supported via `data-theme="light"`
- Restrained accent color
- Tinted neutrals, never pure black or pure white

## Color strategy

Use a restrained product palette by default: tinted neutrals plus one primary accent. Color should carry state and attention, not decoration.

Current production tokens live in `packages/ui/src/styles/global.css`. The app supports `data-theme="dark"` and `data-theme="light"`; dark is the current default.

Core roles:

- `--color-bg`: app background
- `--color-surface`: default content surface
- `--color-surface-raised`: elevated surface
- `--color-shell`: dark navigation rail
- `--color-border`: default divider/border
- `--color-text`: primary text
- `--color-text-muted`: secondary text
- `--color-accent`: primary action and active state
- `--color-accent-subtle`: soft accent background
- `--color-success`: completion/progress
- `--color-warning`: attention that needs review
- `--color-danger`: destructive or blocked states

Rules:

- Use OKLCH tokens.
- Do not introduce new hues in components without adding tokens.
- Priority color can use warning/danger scale, but do not make the whole row shout.
- Attention chips may use soft tinted fills and borders.
- Progress should use success sparingly.

## Typography

Primary font: Inter or system sans until Inter is wired explicitly.

Mono font: Fira Code or a system monospace for source keys, time values, and compact numeric metadata.

Rules:

- Use the `Typography` atom for visible text.
- Titles should rely on weight and spacing more than large type.
- Keep body text short and scannable.
- Source keys and time accounting can use mono, but not whole rows.

## Layout principles

- Navigation belongs in the dark left rail.
- Main pages should have a clear header, controls, and one dominant work area.
- Prefer lists and grouped lanes over repeated card grids.
- Use cards when the boundary communicates priority or selection.
- Avoid nested cards.
- Avoid giant top hero metrics on operating surfaces.
- Do not use left-border accent rails for emphasis; prefer full-border, background, spacing, type, or contained chips.
- Vary spacing for rhythm: page padding, group gaps, row padding, and chip spacing should not all be identical.

## Surface density

Stride must support both thinking and scanning.

- **Default:** minimal and scannable for Backlog, close to a focused work queue.
- **Compact:** available as a global app preference later, not as Backlog page chrome.

Do not put a comfy/compact toggle in Backlog controls.

## Components under development

The component library is intentionally small at first.

Current shared primitives:

- `Typography`
- `Button`, with `contained`, `outlined`, and `ghost` variants plus `primary`, `neutral`, `success`, `warning`, and `danger` colors
- `Badge`, with the same semantic color vocabulary and `contained`, `outlined`, and `ghost` styles for compact labels
- `Chip`, with `contained` and `outlined` styles for filters, removable selections, and source/attention metadata
- `TextInput`
- `Select`
- `MultiSelect`
- `Popover`
- `Drawer`
- `Modal`

`AppShell` is app-owned and lives in `apps/web/src/components/AppShell` because it carries
router, workspace, account, status, and platform assumptions. Its sidebar lives in
`apps/web/src/components/AppShell/Sidebar/Sidebar.tsx` so navigation is easy to find. It must
not be exported from `packages/ui`.

Near-term Backlog components should start beside the route and move to `packages/ui` only when stable.

Likely reusable pieces:

- Search field
- Filter trigger
- Segmented view toggle
- Source badge
- Priority indicator
- Status pill
- Attention chip
- Time accounting line
- Spec row
- Action row
- Empty state

## Backlog-specific direction

See [`product/backlog.md`](product/backlog.md) for product requirements.

Design stance:

- Backlog is a triage, refinement, and execution surface, not a reporting dashboard.
- It must support both personal planning and optional team refinement.
- The default shape should be grouped lists with a small recommended strip.
- Specs needing breakdown and specs ready to schedule should feel like two different states in one pipeline.
- Collaborative breakdown should feel in-context, not like a heavyweight ceremony copied from Jira.
- Actions view should feel faster and more table-like than Specs view.
- Blockers should be a supporting lens/filter or coordination section, not a peer tab beside Specs and Actions.

## Motion

Use motion sparingly.

Good uses:

- Active nav or view transitions
- Row hover affordances
- Progress changes
- Starting or ending a session
- Filter chip removal

Rules:

- Respect `prefers-reduced-motion`.
- Avoid bounce/elastic motion.
- Do not animate layout properties.
- Use short ease-out timing.

## Accessibility

- WCAG AA contrast minimum.
- Keyboard navigable controls.
- Visible focus states.
- Do not rely on color alone for priority, status, or blockers.
- Chips and icon-only controls need accessible labels.
- Compact mode must remain readable.

## Copy

Voice: plain, direct, calm.

Use:

- Break down
- Ready to schedule
- Start session
- Claim
- Nudge
- Awaiting approval
- Closed in source · still open here

Avoid:

- Corporate phrases
- Motivational filler
- Surveillance wording
- Em dashes
