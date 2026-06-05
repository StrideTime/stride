---
title: Environments & deployment
updated: 2026-06-03
status: current
owner: jaren
---

# Environments & deployment

The one explicit, safe way Stride ships. The goal of this design: **deploying is boring.**
You should be able to ship without understanding the internals — the pipeline is built so the
unsafe thing is hard to do and the safe thing is the default. If you only read one section,
read [The runbook](#the-runbook).

The locked stack (Cloudflare Workers + Neon + Hono + Drizzle) is the 2026-05-04 entry in
[`.cursor/rules/decisions.mdc`](../../.cursor/rules/decisions.mdc); the environments decision
is the 2026-06-02 entry there. This doc is the operational detail. For the **one-time
click-by-click provisioning** of all the services, see
[`environment-setup.md`](environment-setup.md).

## The three environments

| Env | Job | Deploy trigger | Data | Neon |
|---|---|---|---|---|
| **dev** | Integration. Breaks often, that's fine. QA + dogfooding live here. | **automatic** on merge to `main` | synthetic seed | `Stride Development` project, `dev` branch |
| **staging** | Exact prod mirror. Final smoke + the hotfix proving ground. | one-click promote | synthetic seed (prod-shaped, **no prod data**) | `Stride Development` project, `staging` branch |
| **production** | Real users. | one-click promote, **second approver required** | real | `Stride Production` project (isolated) |

Three rules make this hard to break:

1. **Databases are fully isolated.** `Stride Production` is a separate Neon project from
   `Stride Development`. Separate credentials, separate billing, no shared compute. A mistake in
   dev/staging physically cannot reach production data. **No environment is a copy-on-write
   branch of production** — staging gets prod-*shaped* data from the seed generator, never
   prod *rows*. (Copy-on-write = a Neon branch shares its parent's storage pages and only
   diverges on write; branching prod would mean prod rows are readable in the child. We do not
   do this. See the [E2E section](#end-to-end-tests-the-baseline-branch) for the one place COW is
   used — off a *seed* branch, never prod.)
2. **The same commit is promoted up the ladder.** Build/test happens once on a SHA; staging
   and production deploy that *identical* SHA. What you smoke-tested in staging is byte-for-byte
   what reaches production.
3. **Migrations always ride with the deploy, in every environment** — see
   [Migrations](#migrations).

UAT is intentionally **not** built yet. Add it (between dev and staging) the day a non-developer
needs a stable sign-off environment — i.e. the first external beta tester. Until then it would
be an empty gate.

## The runbook

This is the whole thing. There is nothing else to know to ship safely.

### Deploy to dev
Merge your PR into `main`. Done. CI builds, runs migrations against the dev database, deploys.
Look at the dev URL to see your change.

### Deploy to staging
1. GitHub → **Actions** → **Promote** → **Run workflow**.
2. Environment: `staging`. Commit: leave blank to use the latest green `main`.
3. Run. It migrates the staging database, then deploys.

### Deploy to production
1. Same as staging, but choose Environment: `production`.
2. A **second person must approve** in the GitHub Environments prompt before it proceeds.
3. It migrates production, then deploys the *same commit* that's running on staging.

### When something fails

| Symptom | What it means | What to do |
|---|---|---|
| CI fails on a PR with "schema drift" | You changed the Drizzle schema but didn't commit a migration | Run `pnpm db:generate`, commit the new file in `packages/db/migrations/`, push |
| CI fails on a PR with "destructive migration" | A migration drops/rewrites something and isn't marked reviewed | Confirm it's [expand/contract-safe](#the-expandcontract-rule), then add the `-- @safety:reviewed <reason>` marker line to the migration file |
| Deploy fails at the **migrate** step | The migration errored; **the new code was NOT deployed** | The env still runs the previous version. Fix the migration, re-run the deploy. Nothing is half-shipped. |
| Deploy fails at the **deploy** step | Migration succeeded, code deploy failed | Because migrations are expand/contract-safe, the old code still works against the new schema. Re-run the deploy, or roll back via "Promote" with the previous good commit. |
| Need to undo production | — | "Promote" → `production` → enter the previous good commit SHA. Same one-button path; rollback is just a promotion of an older commit. |

That's it. Every recovery is "re-run the deploy" or "promote an older commit." There is no
manual `wrangler` command, no hand-run SQL, no ssh.

## Hotfixes

A hotfix must be validated against exactly what's live, fast, without disturbing the staging
release candidate.

1. Branch off the **production release tag** (not `main` — `main`/staging may be ahead of prod).
2. Make the fix, open a PR. CI runs.
3. Validate on a disposable prod mirror using the same ephemeral-branch mechanism as the E2E
   job (`e2e.yml`, `workflow_dispatch` on the hotfix branch): a COW Neon branch off `baseline`,
   migrate + suite, then torn down. Staging's release candidate is never touched.
4. Promote to production (the normal gated path).
5. **Merge the hotfix branch back into `main`** so the fix isn't lost in the next release. ← the
   step people forget; the PR template has a checkbox for it.

## Migrations

Drizzle migrations are generated at dev time and applied automatically by the deploy.

- **Generate** (dev time, committed to the repo):
  ```bash
  pnpm db:generate      # drizzle-kit reads the schema, writes SQL into packages/db/migrations/
  ```
  The SQL files are the source of truth and are reviewed in the PR.
- **Apply** (CI, automatic, per environment): each deploy runs `pnpm db:migrate` against that
  environment's **direct Neon connection** before deploying code.
  - Direct Neon, **never through Hyperdrive** — Hyperdrive pools/caches connections and is for
    runtime app traffic, not DDL. CI naturally uses the direct URL (Hyperdrive is a Worker
    binding, absent in CI).
  - Idempotent: Drizzle tracks applied migrations, so a deploy with no new migrations is a
    clean no-op. Safe to re-run any deploy.
  - Migrate **gates** the deploy: migrate → (success) → deploy. A failed migration aborts the
    deploy; the environment keeps running its previous version. Nothing is ever half-applied.
  - By the time a migration reaches production it has already run on dev *and* staging.

### The expand/contract rule

This is the single discipline that makes "always migrate on deploy" safe. **A migration must
never break the version of the code currently running**, because (a) Workers roll out gradually
and (b) offline desktop clients replay a queued mutation stream against the server — so old and
new code run at the same time for a window.

So changes are split across releases:

| Want to | Do it as |
|---|---|
| Add a column / table | Additive migration + code, same release. Safe. |
| Remove a column / table | **Release 1:** deploy code that no longer uses it. **Release 2:** migration that drops it. |
| Rename a column | Add new → backfill → deploy code using new → (later) drop old. Never a bare rename. |
| Change a type / add NOT NULL | Add new nullable column → backfill → switch code → enforce constraint later. |

Additive-only migrations are always safe to auto-apply. Destructive ones must follow the
two-release pattern.

### The destructive-migration guard

CI runs `pnpm --filter @stride/db db:check-migrations`, which scans migration SQL for
risky statements (`DROP TABLE`, `DROP COLUMN`, `ALTER ... TYPE`, adding `NOT NULL`, etc.) and
**fails the build** unless that migration file carries a marker:

```sql
-- @safety:reviewed dropping legacy_col; release 41 already removed all reads (STRIDE-123)
```

This forces a human to confirm a destructive change is expand/contract-safe before it can ship.
You cannot accidentally drop a production column.

### Heavy migrations (the escape hatch)

A large table rewrite or a non-`CONCURRENTLY` index build can lock tables and exceed the deploy
timeout. When you hit one, run it out-of-band (off-peak, `CREATE INDEX CONCURRENTLY`, batched
backfill) rather than inline in the deploy. Rare, but documented so it isn't a surprise.

## Seed data

One seed definition feeds local dev, staging, and the E2E baseline branch.

```bash
infisical run -- pnpm db:seed    # insert the deterministic seed dataset (idempotent)
infisical run -- pnpm db:reset   # LOCAL ONLY: drop schema → re-migrate → seed. Refuses non-local URLs.
```

- The seed lives in code (`packages/db/src/seed.ts`), version-controlled, deterministic (fixed
  UUIDs), updated as the schema evolves.
- Make it **deliberately adversarial** — bake in the edge cases real data would expose: huge
  accounts, empty accounts, emoji/RTL text, boundary timestamps, soft-deleted rows. A nasty
  seed catches most of what a prod snapshot would, with zero prod data.
- `db:reset` is destructive and **guarded**: it aborts unless `DATABASE_URL` points at
  `localhost`/`127.0.0.1` (override only with `STRIDE_ALLOW_DESTRUCTIVE=1`, intended for the
  ephemeral-test-DB pipeline, never for staging/prod).

### Local development

Run Postgres in Docker for the inner loop (fast, offline, free, and RLS behaves identically to
Neon so it's faithful). Wipe and refill anytime with `pnpm db:reset`. Use the shared Neon `dev`
branch only for integration against deployed services.

### End-to-end tests (the baseline branch)

This is the one place copy-on-write is used — **off a seed branch, never off production**:

1. Keep a Neon **baseline** branch = migrations applied + seed loaded.
2. Each E2E run **COW-branches off baseline** → an instant, isolated, identical database.
3. Run the suite, record pass/fail, delete the branch.

Pristine reproducible fixtures in milliseconds, fully isolated, zero prod lineage. Same seed →
same fixtures → stable assertions → trustworthy regression tracking. Can run on a schedule.

## Tooling: Depot + Infisical

Two choices make the pipeline faster and the secret story cleaner. Neither changes the *shape*
of the pipeline above.

- **Depot for CI runners.** Depot is a **drop-in replacement for GitHub-hosted runners**, not a
  replacement for GitHub Actions — the workflow YAML is unchanged except `runs-on: ubuntu-…`
  becomes `runs-on: depot-ubuntu-24.04`. You get ~3× faster runners and an automatic distributed
  cache (turbo, pnpm, Docker) with no config. GitHub Actions stays the orchestrator.
- **Infisical for secrets — not `.env` files, not GitHub's secret store.** Infisical is the
  single source of truth for secrets, per environment.
  - **Local dev:** `infisical login` once (your user account), then `infisical run -- pnpm dev`
    injects that environment's secrets into the process. No `.env` to manage.
  - **CI:** a **machine identity with keyless OIDC** — GitHub mints a short-lived OIDC token,
    Infisical validates it, secrets are fetched for the job's lifetime only. **Zero long-lived
    secrets stored in GitHub** (the `Infisical/secrets-action` step in every deploy). This is
    the "server-grade credential, not a dev OAuth login" model — and OIDC means there's no
    client secret to store either; only the non-secret `identity-id` / project slugs (GitHub
    *variables*).
  - **Cloudflare Worker runtime secrets:** Infisical's **native Cloudflare Workers secret sync**
    pushes secrets into each Worker environment. Don't run `wrangler secret put` by hand.
  - Name the runtime Infisical environments to match: `dev`, `staging`, `production` (so
    `env-slug` = our environment name). CI-only Neon branch credentials live in a separate
    `stride-ci` project with a `ci` environment, because Infisical's free plan only allows three
    environments per project.

## Secrets & configuration

- **Source of truth is Infisical** (see above), per environment: `DATABASE_URL` (the **direct**
  Neon URL used by the migrate step), `CLOUDFLARE_API_TOKEN`, `BETTER_AUTH_SECRET`, etc. Runtime
  app traffic uses the Hyperdrive binding in [`apps/web/wrangler.toml`](../../apps/web/wrangler.toml);
  Worker secrets arrive via the Infisical→Cloudflare sync.
- **GitHub Environments are for APPROVAL GATES only, not secret storage.** The protection rules
  (GitHub → Settings → Environments) enforce the gates: `production` requires a reviewer,
  `staging` optionally. The `environment:` key in `deploy.yml` binds them; they can't be bypassed
  by editing a workflow.
- A non-secret `STRIDE_ENV` var (`dev`/`staging`/`production`) is set per Worker environment and
  is the source of truth for [feature flags](#feature-flags) — never infer the environment from
  the database URL.
- `.env.example` (repo root) documents *which* variables exist; values live in Infisical.
  `.infisical.json` pins the project for `infisical run`.

## Feature flags

Flags are a **separate system** from environments. All three environments run the same migrated
schema; flags decide what's *visible* within an environment at runtime, keyed off `STRIDE_ENV`.

- To hide data, **gate the query/endpoint server-side** in the Hono handlers — not just the UI,
  or the data still goes over the wire.
- Early on, a typed config object with per-environment overrides is plenty. Graduate to a flag
  service only when you need runtime toggling or per-user/per-team targeting (the team layer
  will).

## Pipeline at a glance

All jobs run on Depot runners; every deploy job fetches secrets from Infisical via OIDC.

```
PR opened ─► CI: lint · typecheck · build · test · schema-drift check · destructive-migration guard

merge to main ─► deploy-dev (automatic)
                 └─ Infisical(dev) ─► migrate(dev, direct Neon) ─► deploy(wrangler --env dev)

Promote (manual) ─► staging   ─► Infisical(staging) ─► migrate ─► deploy(--env staging)
Promote (manual, 2nd approver) ─► production ─► Infisical(production) ─► migrate ─► deploy(--env production)
                                  (same commit promoted up; never rebuilt per env)

Nightly / on-demand ─► E2E: COW branch off `baseline` ─► migrate ─► test:e2e ─► delete branch
```

Files: [`.github/workflows/`](../../.github/workflows) (`ci` · `deploy` · `deploy-dev` ·
`promote` · `e2e`), [`.github/pull_request_template.md`](../../.github/pull_request_template.md),
[`apps/web/wrangler.toml`](../../apps/web/wrangler.toml) (per-env Worker config),
[`.infisical.json`](../../.infisical.json) + [`.env.example`](../../.env.example) (secrets),
[`packages/db`](../../packages/db) (`db:generate` / `db:migrate` / `db:seed` / `db:reset` /
`db:check-migrations`).
