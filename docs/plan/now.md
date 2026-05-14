---
title: Now
updated: 2026-05-13
status: current
owner: jaren
---

# Now

What's actively in flight. Keep this short; update it often. The bigger picture is [`roadmap.md`](roadmap.md).

## In progress

- **Phase 1 — frontend prototype system.** The MVP cut is current. Next work should iterate the FE prototype with `$impeccable` and mocked data. Keep `apps/api` as a buildable Hono stub until the FE clarifies the real Hono RPC surface.

## Next up

1. Keep the workspace green while the backend is stubbed.
2. Phase 1: replace the `apps/web` Vite scaffold with TanStack Start; author the token layer (`packages/ui/src/styles/global.css`); stand up Storybook. No component catalog yet.
3. Phase 2: build the **Today** screen vertically with `$impeccable craft`; use mock data first, and create atoms JIT into `packages/ui`.

## Recent

- 2026-05-13 — Parked the incomplete generic task API. `apps/api` is a Hono stub while the FE prototype defines the backend shape.
- 2026-05-12 — Created the `docs/` vault and `stride/CLAUDE.md`; migrated `PRODUCT.md` in from `claude-design-files/`; wrote the product spec; inventoried superseded material.
