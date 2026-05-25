---
title: Backend platform considerations
updated: 2026-05-25
status: draft
owner: jaren
---

# Backend platform considerations

Research note from the 2026-05-25 architecture discussion. This is **not** an
architecture decision and does not supersede the locked stack in
[`../../.cursor/rules/decisions.mdc`](../../.cursor/rules/decisions.mdc). If the stack
changes, append a new ADR there.

## Why this is being reconsidered

Stride is still early enough that the backend platform can change without rewriting a
large production system. The current docs lock a Cloudflare-native stack:

- TanStack Start SSR for web and SPA mode for desktop.
- Hono on Cloudflare Workers.
- Neon Postgres + Drizzle.
- Better Auth.
- Cloudflare Queues / Cron for source sync.
- Durable Objects + WebSockets deferred for realtime.

The concern is whether this stack asks Stride to build too much platform machinery before
the product loop is proven. Convex is appealing because it gives the product a reactive
database, live queries, typed server functions, scheduled/background work, dashboard
visibility, and code-defined authorization in one system.

The counter-concern is vendor lock-in, especially because Convex's value comes from using
its database/function/reactivity model directly.

## Product capabilities implied by the app

Treating the current frontend as a product map, Stride will need:

- Authenticated web app with workspace/team context.
- Desktop SPA build and tray route using the same web app.
- Source OAuth, webhooks, polling fallback, and idempotent sync for Jira first, then
  Linear/GitHub later.
- Spec/action CRUD with optimistic interactions.
- Sessions, live timers, feeling check-ins, jots, and durable recovery.
- Schedule planning: day queries, drag/resize mutations, external calendar imports later.
- Inbox/attention states derived from source events, handoffs, approvals, blockers, and
  source drift.
- Notifications and tray banners for time-sensitive context.
- Realtime or near-realtime updates across tabs, desktop windows, devices, and eventually
  team members.
- Data ownership: export, honest deletion, audit/provenance, and privacy-safe aggregate
  surfaces.
- Offline/local persistence later, especially for desktop.

This means the frontend host and backend runtime should be chosen together. Stride is not
just a static frontend with a CRUD API.

## SSR stance

Keep TanStack Start SSR as the web target even if most logged-in data is client-heavy.
SSR matters for:

- Authenticated route gating before hydration.
- Loading current user/workspace/team/source mapping on first render.
- Invite, onboarding, and source OAuth callback flows.
- Deep links such as `/specs/$specId`.
- Same-origin API/session handling if cookies are used.
- Future public-ish surfaces such as invites, source connection status, changelog, docs,
  and billing.

SSR should not own live execution state. Timers, tray state, schedule drag/resize,
optimistic action edits, and offline queues remain client-heavy.

The long-term shape still makes sense:

```txt
Web: TanStack Start SSR-capable
Desktop: same app, SPA build
Tray: same app, /tray route
Backend: chosen platform/runtime
```

## Convex option

Convex gives the product the most built-in application behavior:

- Reactive database and live queries.
- Typed queries, mutations, and actions.
- Client updates when shared data changes.
- Background actions and crons.
- Built-in platform dashboard, health/insights, auth integrations, logs/exception
  reporting on higher plans, backups on Professional, and compliance artifacts.
- Code-defined authorization in backend functions instead of Postgres RLS.

This maps well to Stride because Backlog, Today, Schedule, Tray, Inbox, source sync, and
future team state all benefit from reactive data.

The tradeoff: Convex is not a drop-in database. It becomes the backend and data model
runtime. If Stride uses Convex, the architecture should treat it as a backend pivot, not a
small dependency.

### Convex lock-in mitigation

The goal should be to make Convex replaceable at the product boundary, not invisible.
Do not hide Convex so thoroughly that Stride loses the value of live queries.

Recommended boundaries:

- UI imports app/domain hooks and commands, not raw Convex APIs.
- Canonical domain types and Zod schemas live outside Convex.
- Use app-owned UUIDs; never expose Convex `_id` as a domain ID.
- Expose use-case functions such as `startSession`, `endSession`, `markActionDone`,
  `syncJiraSpec`, and `listTodayActions`, not generic table access.
- Hide live queries behind app hooks such as `useToday`, `useSpec`, `useBacklog`, and
  `useSessionState`.
- Keep source sync logic as portable service/use-case code that Convex actions call.
- Build `exportWorkspaceData(workspaceId)` early, emitting canonical Stride JSON rather
  than raw Convex documents.
- Normalize auth identity into Stride-owned `User`, `Workspace`, and `Membership` domain
  models.

With this discipline, leaving Convex later is still a backend rewrite, but not a product
rewrite.

### Better Auth with Convex

Better Auth can run with Convex through the maintained `@convex-dev/better-auth`
component. The Better Auth instance runs on Convex; secrets and OAuth configuration live
in the Convex deployment. Convex authenticates WebSocket/RPC calls with JWT/OIDC-style
identity.

Expected complexity:

- Medium-low for a normal web app.
- Medium for Stride because Tauri/desktop bearer auth, deep links, and source OAuth
  callback flows still require careful design.

## Cloudflare + Neon option

The current stack gives more control and portability:

- TanStack Start SSR on Cloudflare Workers.
- Hono API mounted in the same Worker.
- Neon Postgres + Drizzle for portable relational data.
- Better Auth with Hono and Drizzle/Postgres.
- Cloudflare Queues for source sync.
- Cloudflare Cron for Jira polling fallback.
- Durable Objects + WebSockets for realtime later.
- Workers Analytics Engine and external observability for custom analytics.

This maps well to Stride's long-term needs, especially source sync, SQL/reporting,
auditing, and migration optionality. The cost is that Stride must build the application
platform pieces itself.

### What it takes to approximate Convex reactivity

The pragmatic version:

```txt
client mutation
  -> Hono route
  -> auth + permission checks
  -> Postgres transaction
  -> write domain row(s)
  -> write entity_events/outbox row
  -> Queue or direct publish
  -> Durable Object keyed by workspace/user
  -> WebSocket broadcast
  -> clients invalidate TanStack Query keys and refetch
```

This gives realtime invalidation, not true Convex-style live query tracking.

Core pieces:

- `entity_events` or transactional outbox table with `workspaceId`, `entityType`,
  `entityId`, `eventType`, and `version`.
- Mutation service layer that always writes domain changes and outbox events in one
  transaction.
- Durable Object broadcaster keyed by workspace or user.
- WebSocket client with reconnect/resume.
- Query-key invalidation map, e.g. `action.updated` invalidates `spec`, `backlog`,
  `today`, `schedule`.
- TanStack Query optimistic updates for local responsiveness.
- `BroadcastChannel` for same-browser-tab coordination.
- Tauri event/shared local store coordination for main window + tray later.

The more ambitious Convex-like version would require query subscription registration,
dependency tracking per query, mutation-to-query dependency mapping, server-side
recomputation or patch generation, auth-aware subscriptions, backpressure, reconnect
resume, and operational tooling. That is a platform project and likely not worth building
early.

### Better Auth with Cloudflare/Hono/Postgres

This is the conventional path:

- Mount Better Auth at `/api/auth/*` in Hono.
- Use the Drizzle adapter with Postgres.
- Store auth tables beside app tables.
- Web uses cookies.
- Desktop likely uses bearer tokens stored in the OS keychain.

Expected complexity:

- Medium for web.
- Medium-high once desktop bearer auth, source OAuth callbacks, and multiple runtime
  origins are included.

## Pricing shape

Numbers checked on 2026-05-25; verify again before deciding.

### Convex

- Free/Starter can be $0 for prototypes.
- Professional is $25/developer/month.
- Professional includes higher included usage: function calls, action compute, database
  storage/I/O, egress, log streaming, exception reporting, daily backups, custom domains,
  email support, and compliance reports.
- Overages include function calls, action compute, database storage/I/O, search, file
  storage, and egress.
- Business/Enterprise has a much larger organizational jump: $2,500/month minimum.

Cost grows with developers, function calls, action compute, storage, I/O, egress, and
eventual need for Business/Enterprise features.

### Cloudflare + Neon

- Cloudflare Workers Paid has a low monthly minimum around $5/month.
- Static assets are cheap/free at high volume.
- Queues are inexpensive; Workers Paid includes a monthly operation allowance and then
  usage-based overage. Most queue messages cost three operations: write, read, delete.
- Durable Object WebSockets can be cheap with hibernation, but expensive if objects stay
  active continuously.
- Neon can start free/low and scales with compute, storage, branches, and always-on
  requirements.
- Workers Analytics Engine has included usage and published usage-based pricing, but
  billing status should be rechecked before relying on it.
- External observability may add Sentry/PostHog/logging costs.

Cost likely stays lower and more tunable at scale, but the engineering cost is higher.

## Public REST API requirement

Stride should eventually expose a public REST API so customers can pull Stride data into
their own systems. This changes the backend-platform decision because a public API is not
just another app route. It is a compatibility contract with consumers Stride does not
control.

Expected public API needs:

- Stable versioned routes, e.g. `/api/v1/specs`, `/api/v1/actions`,
  `/api/v1/sessions`.
- OpenAPI specification.
- API keys first; OAuth2/client-credentials-style delegated access later if partners need
  it.
- Scoped permissions such as `specs:read`, `actions:write`, `sessions:read`.
- Cursor pagination.
- Stable error envelope.
- Idempotency keys for writes.
- Rate-limit headers.
- Webhooks for outbound events.
- Backward-compatibility policy and changelog.
- Contract tests against the OpenAPI spec.

Convex can expose HTTP APIs through HTTP actions and has beta OpenAPI generation through
the Convex helper ecosystem. That makes a public API possible, but Convex's strongest
path is still its app-backend model: typed functions, live queries, and generated client
APIs. A mature external REST API would still need deliberate design around versioning,
auth scopes, rate limits, stable DTOs, and compatibility.

Cloudflare + Hono + Postgres fits the public API requirement more naturally because the
public API is already an explicit HTTP route surface. Hono can serve versioned REST
routes, generate or validate OpenAPI contracts, run Better Auth API-key/OAuth plugins,
and apply rate limits at the edge.

If Convex is chosen for the app backend, strongly consider a separate public API gateway:

```txt
External systems
  -> api.stride.app/v1/...  Hono/OpenAPI/API keys/rate limits
  -> Convex client or HTTP calls
  -> Convex data/functions
```

This keeps Convex's app-layer speed while giving external consumers a stable,
vendor-neutral API boundary. If Stride later moves off Convex, the public API can remain
stable while the backend behind it changes.

### Backward compatibility

When only Stride's frontend consumes the API, backend responses can change alongside the
frontend. A public API is different: external consumers deploy on their own schedule, so
the API becomes a contract.

Usually safe changes:

- Add a new optional response field.
- Add a new endpoint.
- Add a new enum value only if the docs already say clients must handle unknown values.
- Add a new optional request field.

Usually breaking changes:

- Rename a field, e.g. `title` to `name`.
- Remove a field.
- Change a field type or structure, e.g. `estimateMin: 45` to
  `estimate: { minutes: 45 }`.
- Change enum meaning, e.g. `done` to `closed`.
- Change pagination semantics.
- Change error response shape.
- Tighten validation on existing accepted requests.

Public API models should be separate from internal app/domain models:

```txt
Internal model: Spec, Action, Session, SourceConnection
Public model: V1SpecResponse, V1ActionResponse, V1SessionResponse
```

Routes map internal state into stable external DTOs. For example, the internal `Action`
model can evolve from `done: boolean` to `status: "open" | "done" | "archived"` while
`V1ActionResponse` continues returning the same `status: "open" | "done"` contract until
a `/v2` API is introduced.

Recommended public API versioning for Stride:

```txt
/api/v1/specs
/api/v1/actions
/api/v1/sessions
```

Use additive changes inside a version. When something must be replaced:

1. Add the new field/endpoint while keeping the old one.
2. Mark the old field/endpoint deprecated in docs and OpenAPI.
3. Return deprecation headers when practical:

   ```txt
   Deprecation: true
   Sunset: Tue, 25 May 2027 00:00:00 GMT
   Link: <https://docs.stride.app/changelog/...>; rel="deprecation"
   ```

4. Notify affected API-key owners by email or dashboard.
5. Keep the old contract for a long sunset window, likely at least 12 months once the API
   is public.

Stride can still have two API layers:

```txt
Internal app API:
  fast-moving, frontend-owned, may change quickly

Public API:
  stable, versioned, documented, OpenAPI-backed, contract-tested
```

This preserves frontend/product velocity while keeping external integrations safe.

## Current read

Convex is strongest if the priority is product discovery and fast iteration on the real
execution loop. It gives Stride the most important magic immediately: reactive shared
state, simple mutations, and less cache/realtime plumbing.

Cloudflare + Neon is strongest if the priority is long-term control, SQL portability,
explicit source-sync architecture, and lower platform lock-in. It is the more durable
architecture, but only if the extra platform work does not slow product discovery too
much.

Railway + Postgres remains a possible middle path: less edge-native than Cloudflare, less
magical than Convex, but conventional, portable, and code-defined.

The practical recommendation from this discussion:

1. If choosing Convex, call it a backend pivot and protect the product boundary with
   domain types, app-owned IDs, use-case functions, and export discipline.
2. If staying Cloudflare + Neon, do not try to clone Convex. Build optimistic UI plus
   WebSocket invalidation only when realtime is truly needed.
3. Preserve TanStack Start SSR for web and SPA mode for desktop either way.
4. Make the decision with a small vertical spike: user/workspace, spec list, action CRUD,
   start/end session, one sync-like background job, one export path, and one optimistic
   realtime update.
