# Domain Docs

How engineering skills should consume this repo's domain documentation when exploring the codebase.

## Layout

This is a single-context repo for domain-documentation purposes.

Do not create or require a root `CONTEXT.md` or `CONTEXT-MAP.md`. The existing docs vault is the source of truth.

## Before exploring, read these

Start with:

- `docs/INDEX.md` — documentation map; read this before searching the repo
- `docs/product/principles.md` — product principles and privacy/trust commitments before changing any product surface

Then follow the relevant links from `docs/INDEX.md`:

- Product/domain model: `docs/product/*`
- Screens/routes/surfaces: `docs/product/surfaces.md`
- Plan/scope: `docs/plan/*`
- Architecture overview: `docs/architecture/overview.md`

For coding conventions and architectural decisions, read:

- `.cursor/rules/architecture.mdc`
- `.cursor/rules/decisions.mdc`
- The relevant `.cursor/rules/*.mdc` file for the code being touched

## Vocabulary

Use the product vocabulary from:

- `docs/product/glossary.md`
- `docs/product/data-model.md`

Do not introduce synonyms for pinned terms. In particular, respect the banned/discouraged terms listed in the glossary.

## Drift rule

If a change affects product scope, the data model, screens, architecture, or plan, update the matching doc in `docs/` in the same change.

If a change introduces or changes an architectural decision, append an entry to `.cursor/rules/decisions.mdc`.

## ADRs and decisions

This repo does not use `docs/adr/` today. Architectural decisions live in:

- `.cursor/rules/decisions.mdc`

If an engineering skill expects ADRs, treat `.cursor/rules/decisions.mdc` as the ADR log.
