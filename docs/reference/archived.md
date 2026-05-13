---
title: Archived / superseded material
updated: 2026-05-12
status: current
owner: jaren
---

# Archived / superseded material

What exists but is **not current** — so it's neither silently abandoned nor rediscovered the hard way. Paths are relative to `Stride/` (the parent dir; `stride/` is the monorepo, the rest are siblings).

## `Figma Make Files/` — an older, *different* product concept (Feb 2026)

A separate, earlier prototype: a generic team task manager with **points-based gamification** ("3 pts" per task, "12.5/15 points"), "tasks" not "specs", org → team hierarchy, a pricing/landing page — and **no issue-tracker sync at its core**. Different concept and a fully obsolete stack (Supabase, Tailwind, a `@stride/api-client` REST pattern, React Native 0.73). Superseded by the current "issue-tracker overlay" concept (see [`../product/overview.md`](../product/overview.md)) and the 2026-05-04 stack lock.

| File | What it is | Verdict |
|---|---|---|
| `ARCHITECTURE_SUMMARY.md` | proposed `stride-ui` monorepo of shared packages over Supabase + Tauri/Tailwind | superseded — only the *principle* (share types/logic, keep UI platform-specific) survives |
| `stride-ui-structure.md` | detailed file tree for that proposed monorepo | superseded as a plan; generic reference for "what kinds of types exist" |
| `IMPLEMENTATION_GUIDE.md` | deep design for a **Pomodoro timer** + **habit tracking** (data shapes, streak algorithms, Page Visibility API, badges, IndexedDB) | mostly superseded — current prototype has only a light "Focus Time" timer, no habits. Keep as reference *if* habits/Pomodoro return (open-questions Q9): the streak-calc logic, habit/completion data shapes, and background-tab timer handling are still useful |
| `MOBILE_DESIGN.md` | ASCII wireframes for a 5-tab mobile app (gestures, bottom sheets, widgets, biometric auth, tablet split-view) | screen layouts are dated (old "points/Stats" concept), but the **mobile interaction thinking** is useful when the Expo app happens — there is no mobile design for the current model |
| `src/`, `shared-packages/` | the old prototype's React/TS source (~40 components) + embryonic shared-package stubs | superseded code — useful only as a component-inventory checklist (it confirms surfaces like org/team/workload views, settings sub-pages, a landing/pricing page) |

## `stride-web/` — another Figma export

`@figma/my-make-file` — a separate Figma Make export with an empty `guidelines/Guidelines.md` and a `src/`. Superseded; no unique content worth preserving.

## `landing-page/` — the marketing site (status: parked)

A separate marketing website (`stride-landing`), **not part of the `stride/` monorepo**. Stack: React 19 + **Material-UI 7 + Emotion** + `@stridetime/branding` + `@stridetime/theme` — packages that **don't exist in the monorepo**. Predates the 2026-05-04 reset; its messaging still references the desktop-app-download / gamification framing. Not abandoned, but not aligned: open question whether to rebuild it on the app stack (Base UI + CSS Modules), keep it deliberately separate, or retire it (open-questions Q15). Don't treat its `README.md` as a source of truth for the product.

## `claude-design-files/` — the current UX prototype

**Not archived** — it's the active UX reference. See [`design-prototype.md`](design-prototype.md). Listed here only to note: `claude-design-files/PRODUCT.md` is the *old* location of the strategy doc (canonical is now `docs/PRODUCT.md` — the old one can be deleted or repointed); and the `Stride Wireframes.html` / `Stride Prototype.html` / `proto/` / `components/Round*.jsx` inside it are earlier iterations superseded by `Stride App.html` + `app/`.

## The deleted `.agents/` directory

`Stride/.agents/` (containing `STRIDE_MASTER_PLAN.md` with tasks T001–T113, `UI_ROADMAP.md`, `TODO.md`, `FUNCTIONALITY.md`) was deleted at some point. It was tied to the pre-2026-05-04 architecture (PowerSync, Supabase auth, a Tauri React app called `stride-desktop`, Habits/Pomodoro task plans) — much of it invalidated by the stack reset. Superseded by `.cursor/rules/decisions.mdc` (the locked stack) and [`../plan/roadmap.md`](../plan/roadmap.md) (the current plan). Mentioned here because `MEMORY.md` and other notes may still reference it.
