---
title: Roadmap
updated: 2026-05-13
status: draft
owner: jaren
---

# Roadmap

The phased plan. Replaces the deleted `.agents/STRIDE_MASTER_PLAN.md` (which was tied to the pre-2026-05-04 stack and is gone). Granular tasks belong in Jira (see `.cursor/rules/ticket-conventions.mdc`); this is the shape and order.

Guiding shape: **establish the system early (cheap, doesn't depend on knowing every feature), build components just-in-time as screens demand them, refactor up the atomic hierarchy as patterns repeat, and let the BE trail the FE by one screen.** "Strict standards from the start" applies to the *system* (token architecture, atomic taxonomy, file conventions — already largely captured in `.cursor/rules/ui-components.mdc`), not to a pre-built component catalog.

## Phase 0 — Consolidate the docs · *in progress (2026-05-12)*

- [x] Stand up `docs/` vault: `INDEX.md`, folder skeleton, frontmatter convention, `_meta/vault-conventions.md`.
- [x] Add `stride/CLAUDE.md` pointer (the 2026-03-19 decision called for one; it didn't exist).
- [x] Migrate `PRODUCT.md` from `claude-design-files/` → `docs/PRODUCT.md`.
- [x] Write the product spec from the prototype + chats: `overview.md`, `glossary.md`, `surfaces.md`, `data-model.md`.
- [x] Capture undecided questions in `open-questions.md`; inventory superseded material in `reference/archived.md`.
- [ ] Confirm the canonical route list and reconcile `.cursor/rules/react-patterns.mdc` (open-questions Q1).
- [ ] Confirm the MVP cut (`mvp.md` → `current`).

## Phase 1 — Establish the FE system *(no component catalog yet)*

- Replace the bare `apps/web` Vite scaffold with **TanStack Start** (`routes/`, server functions, the `BUILD_TARGET` web/desktop split — see `architecture.mdc`).
- Author the **token layer**: `packages/ui/src/styles/global.css` — CSS custom properties (OKLCH colors, type/spacing/radii/motion scales), starting from the `:root` block in `ui-components.mdc`, refined. Generate `docs/DESIGN.md` from it via `$impeccable document`.
- Stand up **Storybook** in `packages/ui`.
- Wire `react-i18next` + the `en.json` skeleton; set up TanStack Query + TanStack Form scaffolding.
- Do **not** build `Button`, `Card`, etc. yet — those come JIT in Phase 2.

## Phase 2 — Build screens vertically; the component library emerges

- Start with **Today** (the daily-loop centerpiece; smallest prototype file). Use `$impeccable craft`. Each primitive a screen needs (`Typography`, `Button`, `Input`, `Badge`, `StatusPill`, …) gets created *properly the first time* in `packages/ui/src/components/atoms/<Name>/` with `.tsx` + `.module.css` + `.stories.tsx` + `.test.tsx` + `index.ts`, per `ui-components.mdc`.
- Then **Backlog**, **Schedule**, **Spec modal**, **Tray** — each reuses existing atoms and adds a few; molecules/organisms accrete. By screen 3–4 the library stabilizes.
- `$impeccable extract` formalizes a pattern into `packages/ui` only once it's proven across 2+ screens — earlier is guessing. Keep a running inventory (a `docs/product/components.md` once it's worth having, or just `packages/ui`'s barrel files).
- Live-iterate visuals with `$impeccable live` pointed at TanStack Start's HMR dev server — not the old Babel prototype.

## Phase 3 — Backend, trailing the FE by one screen

- Keep `apps/api` as a buildable Hono stub during FE prototyping. Do not elaborate the backend until the mocked FE flows make the required RPC surface obvious.
- Once the FE shape is clear: `apps/api` (Hono on CF Workers — replaces the current `@hono/node-server` stub), `packages/db` (Drizzle schema + drizzle-zod), `packages/api-client` (`hc` client), `packages/queue` (mutation-queue abstraction).
- Build entities + Hono routes one beat behind the FE — the FE for screen N tells you exactly what screen N's API needs; no speculative endpoints. Follow `service-patterns.mdc` / `db-patterns.mdc` / `testing.mdc`.
- Source sync (Jira + Linear): CF Queue consumer + cron fallback. Better Auth + RLS. `processed_mutations` idempotency table.
- Wire the desktop: `apps/desktop` Tauri shell, two windows, native SQLite driver for the queue.

## Steady state

New screen → new atoms JIT → extract when proven → BE catches up → **every change updates the matching doc in `docs/` (or appends to `.cursor/rules/decisions.mdc`) in the same PR.** See [`../_meta/vault-conventions.md`](../_meta/vault-conventions.md).

Mobile (Expo), Insights expansion (Performance → Team status → Team analytics → Burnout → Goals → Focus time), multi-team/roles UI, billing/admin, real-time presence — all post-v1; see [`../product/mvp.md`](../product/mvp.md).
