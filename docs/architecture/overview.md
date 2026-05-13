---
title: Architecture overview
updated: 2026-05-12
status: current
owner: jaren
---

# Architecture overview

This is the one-screen picture. The **authoritative spec** is [`.cursor/rules/architecture.mdc`](../../.cursor/rules/architecture.mdc) (monorepo layout, dependency rules, build targets, Tauri windows, CF Workers layout, the offline mutation queue, source-sync boundaries, the core data model). The **locked stack** is the 2026-05-04 entry in [`.cursor/rules/decisions.mdc`](../../.cursor/rules/decisions.mdc). Don't re-derive either here — read those.

## Stack, in brief

| Layer | Choice |
|---|---|
| Web framework | TanStack Start — SSR for web, SPA mode for desktop |
| Desktop shell | Tauri 2.0 — wraps the web SPA build; no separate React app in `apps/desktop/` |
| Mobile | Expo / React Native (future) |
| API | Hono on Cloudflare Workers — same Worker as TanStack Start, mounted at `/api/$` |
| Database | Neon (Postgres) · ORM Drizzle + drizzle-zod · pooling Cloudflare Hyperdrive |
| Auth | Better Auth |
| Tenant isolation | Postgres RLS (session context in a transaction wrapper) |
| Client state | TanStack Query (structured to migrate to TanStack DB when it's stable) |
| Offline | Server-authoritative + optimistic updates + a durable SQLite mutation queue |
| Offline SQLite | wa-sqlite/OPFS (web) · Tauri SQL plugin (desktop) · expo-sqlite (mobile) |
| Source sync | Cloudflare Queues (webhook ingest) + CF Cron Triggers (Jira polling fallback) |
| Forms | TanStack Form + Zod · DnD: dnd-kit · i18n: react-i18next |
| UI | Base UI (unstyled primitives) + CSS Modules + Phosphor icons + Inter / Fira Code · atomic design · Storybook |
| Real-time | Deferred post-v1 (CF Durable Objects + WebSocket) |
| Type flow | Drizzle schema → drizzle-zod → Hono RPC → `hc` typed client → component props (one source of truth, no manual duplication) |

## Target monorepo layout

```
apps/
  web/       TanStack Start — SSR for web, SPA build for Tauri
  desktop/   Tauri 2.0 shell only — Rust, tauri.conf.json, native plugins; no React
  mobile/    Expo (future)
  api/       Hono on Cloudflare Workers — all business logic
packages/
  ui/         shared React components — no business logic, no data fetching
  api-client/ typed Hono `hc` client — used by web, desktop, mobile
  queue/      mutation-queue abstraction — pure TS, storage driver injected per runtime
  db/         Drizzle schema + drizzle-zod types — imported by api/ only
```

Dependency direction is strict (see `architecture.mdc`): `apps/web` → `packages/{ui, api-client, queue}`; `apps/api` → `packages/db`; `apps/web` never imports `apps/api` directly.

## Where current code differs from the target (known gaps)

The conventions are written **ahead of** the code — that's intentional. As of 2026-05-12 the repo (one commit, "initial commit") has:

- `apps/web/` — a bare `create-vite` React + TS scaffold. **To do:** replace with a TanStack Start app (`routes/`, server functions, the SSR/SPA build-target split).
- `apps/server/` — a "Hello Hono" + Drizzle starter. **Naming mismatch:** everything in `.cursor/rules/*.mdc`, the git commit scopes, and the build commands say `apps/api`. Either rename the dir to `apps/api` (recommended) or update the conventions. Tracked in [`../product/open-questions.md`](../product/open-questions.md) Q13.
- `packages/` — only `eslint-config` and `typescript-config` exist. **To do:** add `ui`, `db`, `api-client`, `queue` when they're needed (per the roadmap — not all at once).
- `apps/desktop/` (Tauri) — not created yet.
- No `.claude/` dir; `stride/CLAUDE.md` was added (2026-05-12) as the agent pointer.
- `landing-page/` (a sibling directory, not in this monorepo) is on a different stack and predates the reset — see [`../reference/archived.md`](../reference/archived.md).

When in doubt about *what should exist*, follow `.cursor/rules/`. When the gap matters for a task, flag it.
