---
title: Roadmap
updated: 2026-05-21
status: draft
owner: jaren
---

# Roadmap

The shape and order of the work, framed by time horizon. Granular tasks belong in Jira
(see `.cursor/rules/ticket-conventions.mdc`). Re-sequenced 2026-05-21 around the re-cut
MVP ([`../product/mvp.md`](../product/mvp.md)); replaces the earlier Phase-0–3 framing.

**Horizons past the MVP are evidence-driven, not document-driven.** Build the next layer
when actual usage demands it — not because a doc said so. Resist roadmap-by-document.

## How the build works (methodology — applies at every horizon)

Unchanged from the earlier plan, because it's orthogonal to scope: **establish the system
early** (token architecture, atomic taxonomy, file conventions — already in
`.cursor/rules/ui-components.mdc`); **build components just-in-time** as screens demand
them; **extract up the atomic hierarchy** only once a pattern is proven across 2+ screens;
**let the BE trail the FE by one screen**. "Strict standards from the start" applies to
the *system*, not to a pre-built component catalog.

Foundational, scope-independent setup (do once, early): replace the `apps/web` Vite
scaffold with **TanStack Start**; author the **token layer** (`packages/ui` global CSS,
OKLCH); stand up **Storybook**; wire `react-i18next`, TanStack Query, TanStack Form.

## Now — MVP · ~90 days

The smallest useful Stride. Target: **one developer uses it for a week of real work and
wants to keep using it.** Full scope and rationale in [`../product/mvp.md`](../product/mvp.md).

Build order — **execution before reflection**:

1. **Session flow end-to-end** — start → live timer → end → feeling check-in → note →
   mark-done. The core capture loop.
2. **Spec view + real Actions** — Action CRUD, estimates, done-state (execution-step model).
3. **Schedule** — both time-accounting modes, possibly simplified from the current spec.
4. **Today + Tray** — simplified (Today to one dominant question; Tray idle + live).
5. **"My data" view** + **one-way Jira sync**.

BE trails the FE by one screen: User, Workspace (RLS stays), SourceConnection (Jira),
Spec/Action/Session/Capture, the signal-capture tables, the empty cross-cutting junction
table. Architectural commitments (typed API, asymmetric access, honest deletion,
source-native storage, provenance-ready) are baked in now — see
[`../product/mvp.md`](../product/mvp.md) and the 2026-05-21 ADR entry.

Ship to yourself first, then one friend, then maybe three. No marketing, no launch, no
scope expansion.

## 3–6 months — single-player polish

Iterate on what real usage reveals. Add features only when actual behaviour demands them:
Linear sync when the second user asks; richer Schedule when a user actually wants to plan
in Stride; schedule event types ship as workspace preferences seeded with defaults.

## 6–12 months — the team layer

When the first team wants to use Stride together, add the *minimum* team layer: Workspace
membership, roles, aggregate views — with the [`../product/principles.md`](../product/principles.md)
disciplines architecturally enforced (aggregates can't return individual rows). Calendar
sync if it's blocking a real user. The offline mutation queue lands here if multi-device
use makes it real.

## 12–18 months — Insights, when there is signal

Now there is real captured signal to reflect on. Operational insights return **inline
first** (inside Today, the Tray, the Spec view — they change a decision in the moment).
The reflective Insights surface returns only when real users articulate what they want to
see.

## Beyond 18 months

Signal exposure (a public API / webhooks / MCP server, in response to real customer
demand), mobile, real-time presence, the deeper context-synthesis vision from
[`../product/overview.md`](../product/overview.md) — all genuinely further out and
deliberately not specced here. The information needed to plan them does not exist yet.

## Steady state

New screen → new atoms JIT → extract when proven → BE catches up → **every change updates
the matching doc in `docs/` (or appends to `.cursor/rules/decisions.mdc`) in the same
PR.** See [`../_meta/vault-conventions.md`](../_meta/vault-conventions.md).
