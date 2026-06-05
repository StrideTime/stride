---
title: Environment setup runbook
updated: 2026-06-03
status: current
owner: jaren
---

# Environment setup runbook

The one-time, click-by-click setup to wire **Neon + Cloudflare + Infisical + Depot + GitHub**
together. The *design* (why it's shaped this way) is [`environments.md`](environments.md) — this
is the *provisioning* checklist. Do the steps **in order**; each produces values the next needs.

Assumes you already have accounts for all five and the repo is `StrideTime/stride` (adjust names
as needed).

## How the pieces connect (read once)

```
Neon ──connection strings──► Cloudflare Hyperdrive (runtime pooling)  ──► Worker
  │                                                                         ▲
  └──direct URLs + API key──► Infisical (secrets, per env) ──OIDC──► GitHub Actions (on Depot)
                                   │                                        │
                                   └──secret sync──► Cloudflare Worker secrets (runtime)
GitHub Environments ──► approval gates only (no secrets)
```

- **Neon** holds the databases. Two values matter per env: the **direct** connection string
  (for migrations) and the same string handed to Hyperdrive (for runtime).
- **Cloudflare** runs the Worker and pools DB connections via Hyperdrive (one config per env).
- **Infisical** is the single source of truth for secrets, per environment. CI reads them via
  keyless OIDC; Cloudflare runtime secrets are pushed by Infisical's sync.
- **GitHub** stores **no secrets** — only two non-secret *variables* and the approval gates.
- **Depot** is where the jobs run (faster runners + cache).

## Values you'll collect (fill as you go)

| Value | From | Goes into |
|---|---|---|
| `Stride Production` direct connection string | Neon (Step 1) | Infisical `production` → `DATABASE_URL` |
| `Stride Development` dev/staging direct strings | Neon | Infisical `dev` / `staging` → `DATABASE_URL` |
| Neon API key | Neon | Infisical `stride-ci` / `ci` → `NEON_API_KEY` |
| `Stride Development` project id | Neon | Infisical `stride-ci` / `ci` → `NEON_PROJECT_ID` |
| Cloudflare Account ID | Cloudflare | `apps/web/wrangler.toml` → `account_id` |
| 3× Hyperdrive config IDs | Cloudflare (Step 2) | `apps/web/wrangler.toml` → `id` per env |
| Cloudflare deploy API token | Cloudflare | Infisical (all envs) → `CLOUDFLARE_API_TOKEN` |
| Cloudflare sync API token | Cloudflare | Infisical → Cloudflare integration |
| Infisical runtime project slug | Infisical (Step 3) | GitHub variable `INFISICAL_PROJECT_SLUG` |
| Infisical CI project slug | Infisical (Step 3) | GitHub variable `INFISICAL_CI_PROJECT_SLUG` |
| Infisical project id | Infisical | `.infisical.json` → `workspaceId` |
| Infisical machine identity id | Infisical | GitHub variable `INFISICAL_IDENTITY_ID` |

---

## Step 1 — Neon

Create two projects so production is hard-isolated from everything else.

- [ ] **Create project `Stride Production`.** Rename its default branch to `production`.
- [ ] **Create project `Stride Development`.** Create branches: `dev`, `staging`, and `baseline`
      (the seed branch the E2E job clones — see Step 6 to load it).
- [ ] For **each** of `production`, `dev`, `staging`: open the branch → Connect → copy the
      **direct** connection string (the one **without** `-pooler` in the host). This is
      `DATABASE_URL`. Keep them straight — they go into matching Infisical envs in Step 3.
- [ ] **Account → API keys → create key** → save as `NEON_API_KEY` (for the E2E branch
      create/delete). Copy the **`Stride Development` project id** (Project settings) as
      `NEON_PROJECT_ID`.

> Note: migrations use these **direct** strings. Runtime traffic will use Hyperdrive (Step 2),
> which you also hand the direct string to — Hyperdrive does its own pooling.

## Step 2 — Cloudflare

- [ ] Copy your **Account ID** (Workers & Pages overview, right sidebar) → put in
      `apps/web/wrangler.toml` `account_id`.
- [ ] **Create 3 Hyperdrive configs** (Storage & Databases → Hyperdrive → Create):
      - `stride-dev` → paste the Neon **dev** direct string
      - `stride-staging` → paste the Neon **staging** direct string
      - `stride-production` → paste the Neon **production** direct string
      Copy each config's **ID** into `apps/web/wrangler.toml` under the matching
      `[[env.<env>.hyperdrive]]` block.
- [ ] **Deploy API token** (My Profile → API Tokens → Create → "Edit Cloudflare Workers"
      template; ensure it covers Workers Scripts: Edit and Hyperdrive: Read for your account).
      Save the token → it becomes `CLOUDFLARE_API_TOKEN` in Infisical (Step 3).
- [ ] **Sync API token** (a second token for Infisical to push Worker secrets): create a token
      with **Workers Scripts: Edit** for the account. Save it for the Infisical→Cloudflare
      integration (Step 3). (You *can* reuse the deploy token; a separate one is cleaner.)

## Step 3 — Infisical

### 3a. Projects & environments
- [ ] Create runtime project **`stride`**. Copy the **project slug** and **project id** (Project
      settings → General). Use environments with exact slugs: **`dev`**, **`staging`**,
      **`production`**. (Infisical ships dev/staging/prod by default — rename `prod`→`production`
      so `env-slug` matches our environment names.)
- [ ] Create or repurpose a CI project **`stride-ci`** with an environment slug **`ci`**.
      This keeps the CI-only Neon branch credentials separate. It also works around Infisical's
      free-plan limit of three environments per project.

### 3b. Secrets (the matrix)
Add each secret to the listed environments:

| Secret | `stride` dev | `stride` staging | `stride` production | `stride-ci` ci |
|---|:--:|:--:|:--:|:--:|
| `DATABASE_URL` (direct Neon, per env) | ✓ | ✓ | ✓ | |
| `STRIDE_ENV` (`dev`/`staging`/`production`) | ✓ | ✓ | ✓ | |
| `CLOUDFLARE_API_TOKEN` (deploy token) | ✓ | ✓ | ✓ | |
| `BETTER_AUTH_SECRET` (unique per env) | ✓ | ✓ | ✓ | |
| `NEON_API_KEY` | | | | ✓ |
| `NEON_PROJECT_ID` (`Stride Development`) | | | | ✓ |

### 3c. Machine identity (keyless OIDC for CI)
- [ ] **Organization → Access Control → Identities → Create identity** (e.g. `github-ci`).
- [ ] Auth method **OIDC Auth**:
      - OIDC Discovery / Issuer: `https://token.actions.githubusercontent.com`
      - Audience: `https://github.com/StrideTime` (your org URL)
      - **Bound subject:** `repo:StrideTime/stride:*` (scopes trust to this repo; tighten to
        specific refs/environments later if you want)
- [ ] **Add the identity to both `stride` and `stride-ci`** with permission to read secrets.
      Read-only is enough for CI/deploy.
- [ ] Copy the **identity id** → GitHub variable in Step 4.

### 3d. Cloudflare Worker secret sync (runtime)
- [ ] **Integrations → Cloudflare** → connect using the **sync API token** + your Account ID.
- [ ] Create **one sync per environment**: source = Infisical env (`dev`/`staging`/`production`),
      destination = the matching Cloudflare Worker (`stride-web`, env `dev`/`staging`/`production`).
      This pushes runtime secrets into the Worker so you never run `wrangler secret put`.

## Step 4 — GitHub

### 4a. Variables (non-secret) — repo Settings → Secrets and variables → Actions → **Variables**
- [ ] `INFISICAL_IDENTITY_ID` = the machine identity id (Step 3c)
- [ ] `INFISICAL_PROJECT_SLUG` = `stride`
- [ ] `INFISICAL_CI_PROJECT_SLUG` = `stride-ci`

> No GitHub **Secrets** are needed — OIDC means nothing long-lived is stored here.

### 4b. Environments (approval gates only) — Settings → Environments
- [ ] Create `dev`, `staging`, `production`.
- [ ] On **`production`**: enable **Required reviewers** (add yourself / the approver). Optionally
      add a reviewer on `staging`. These gates are what the `environment:` key in `deploy.yml`
      triggers.

## Step 5 — Depot

- [ ] In Depot, **connect your GitHub organization** and install the Depot GitHub app for the
      `stride` repo, then **enable managed runners**. The workflows already use
      `runs-on: depot-ubuntu-24.04`; no YAML change needed.

## Step 6 — Fill repo placeholders & load the seed branch

- [ ] `apps/web/wrangler.toml`: replace `<ACCOUNT_ID>` and the three `<HYPERDRIVE_ID_*>`.
- [ ] `.infisical.json`: replace `<INFISICAL_PROJECT_ID>` with the project id.
- [ ] **`pnpm install`** (the lockfile is stale after the `postgres` / `tsx` additions — CI's
      `--frozen-lockfile` fails until you refresh and commit it).
- [ ] **Seed the `baseline` branch** (one-time; refresh when the seed changes):
      ```bash
      DATABASE_URL="<neon baseline direct string>" pnpm db:migrate
      DATABASE_URL="<neon baseline direct string>" pnpm db:seed
      ```

## Step 7 — Local development

- [ ] Install the Infisical CLI and log in:
      ```bash
      brew install infisical/get-cli/infisical   # or see infisical.com/docs/cli
      infisical login
      ```
- [ ] Run anything with injected secrets (no `.env` needed):
      ```bash
      infisical run -- pnpm dev
      infisical run -- pnpm db:migrate
      infisical run -- pnpm db:seed
      ```
- [ ] For a local Postgres inner loop instead of Neon dev, run Docker Postgres and point a
      local `DATABASE_URL` at it; `pnpm db:reset` is allowed only against `localhost`.

## Step 8 — Verify end-to-end

- [ ] **CI on Depot:** open a PR → the `CI` workflow runs on a `depot-…` runner and the
      schema-drift + destructive-migration guards pass.
- [ ] **Secrets via OIDC:** merge to `main` → `Deploy dev` runs, the *Inject secrets (Infisical)*
      step succeeds (no GitHub secrets involved), migrate + deploy complete.
- [ ] **Runtime secrets:** confirm the dev Worker has its synced secrets (Cloudflare dashboard →
      the Worker → Settings → Variables).
- [ ] **Promotion + gate:** run **Actions → Promote → `production`** → confirm it **waits for
      your approval** before migrating/deploying.
- [ ] **E2E ephemeral DB:** run **Actions → E2E** manually → a `e2e-<run>` Neon branch appears
      under `Stride Development`, the suite runs, and the branch is deleted afterward.

---

## Appendix — gotchas

- **Direct vs pooled Neon string:** migrations and Hyperdrive both want the **direct** (no
  `-pooler`) string. Don't put a pooled string in `DATABASE_URL`.
- **Infisical env slugs must equal our env names** (`dev`/`staging`/`production`) — the deploy
  workflow passes `env-slug: ${{ inputs.environment }}` verbatim. The `ci` env is separate.
- **OIDC bound subject too narrow** → the *Inject secrets* step fails with an auth error. Start
  with `repo:StrideTime/stride:*` and tighten later.
- **Action versions** are pinned to concrete tags (`Infisical/secrets-action@v1.0.16`,
  `neondatabase/*`). For supply-chain safety on secret-handling actions, consider pinning to a
  commit SHA.
- **`production` Neon branch name:** if you kept Neon's default `main`, either rename it to
  `production` or just remember the mapping — only the connection string matters to the pipeline.
