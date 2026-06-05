---
title: Product principles
updated: 2026-05-21
status: current
owner: jaren
---

# Product principles

The non-negotiable commitments behind Stride. Surfaces, schemas, defaults, and copy
all answer to this file. When a design choice is unclear, the test below resolves it.

## Purpose

**Stride exists to give a person momentum and a clear view of their own growth.**
It captures signal to serve the person who produced it. It surfaces patterns to a
team only in aggregate, for that team's shared benefit. It never becomes a tool for
ranking, comparing, or monitoring individuals.

When a person starts a session, there must be **zero doubt in their mind** that this
is for them — not a feed to their manager's dashboard.

## The test

For any feature, default, schema field, or line of copy:

> **Does this make the user more certain the data is theirs — or less?**

Less = don't ship it. This single question catches leaderboards, default-on presence,
per-person comparison widgets, and surveillance-flavoured copy without having to
enumerate them.

## Why this is not optional — privacy is a data-integrity requirement

The reasoning that makes every principle below load-bearing, not decorative:

> Trust → honest input → accurate data → useful insights → product value.

If a person believes their data can be used against them — ranked, compared, watched —
they stop keeping it honest. They round their estimates, pad their sessions, under-report
the hard days. A surveillance-flavoured Stride does not just feel bad; it **produces
garbage data** and therefore cannot deliver the insights that are its entire reason to
exist. Privacy is not the ethical wrapper around the product. It is a functional
precondition for the product working at all.

This reframing matters because it makes privacy non-negotiable for *self-interested*
reasons. When a future version is tempted to add a leaderboard, the answer is not "that
clashes with our values" — it is "that will corrupt our dataset."

## The contract Stride offers the user

> *Give me your signal. I will use it for your benefit. I will use it in aggregate for
> your team's collective benefit. I will never use it against you.*

## The commitments — and how each is enforced

Each principle names how it is **architecturally** enforced, not just promised. A promise
that lives only in marketing copy is not a principle.

1. **Visible data ownership.** The user can see and delete the data Stride has captured
   about them. *Enforced by:* a "my data" surface in v1 (sessions, feeling check-ins,
   session notes, with delete) — see [`mvp.md`](mvp.md). The system may record more than it
   surfaces, but the user can always see what was recorded.

2. **Asymmetric access.** Per-person signal lives in the database; the API surface for
   aggregates **cannot return individual rows**. *Enforced by:* aggregate endpoints
   designed from the first endpoint so that individual decomposition is not expressible —
   not a filter applied after the fact.

3. **Honest deletion.** When a user deletes their data, it is gone — aggregates recompute
   without it. *Enforced by:* hard deletes that trigger aggregate recomputation, not a
   `deleted` flag that leaves the data feeding stats. (Distinct from the operational soft
   delete used for sync/offline correctness.)

4. **Auditable provenance.** Every derived value (a stat, a suggestion, an inline
   observation) maintains pointers to the inputs that produced it. *Enforced by:* lineage
   metadata on derived values. v1 has no derived-value surface (Insights is deferred), so
   this is a **named commitment for when Insights returns**, not v1 work — but it must be
   designed in the day the first derived value ships, never retrofitted.

5. **Privacy defaults favour the individual.** Presence and "focus status" indicators
   default **off**, opt-in only. *Enforced by:* the default value in the schema, not a
   setting the user is expected to find and disable.

6. **IC autonomy over the personal experience.** The individual's personal experience of
   Stride is theirs. There is no "team default with individual override if the team
   allows it" — team admins do not get to enforce conformity on how a person tracks their
   own work. Teams receive aggregate signal computed from whatever shape the IC chose.
   *Enforced by:* personal preferences (time-accounting mode, working hours, presence)
   are personal-scope settings with no admin override path.

## Culture and tone

The contract is not only architecture — it is how Stride *speaks*. Copy, empty states,
the feeling check-in, streaks, and notifications are warm, individual, and
forward-looking. Stride never frames a person against their peers. No leaderboards, no
"you vs. the team," no comparison-by-default. Gamification is derived from the person's
own real captured data and stays minimal (icons, not emoji; streaks, not points).

## Standing review questions

Use these when adding a surface or a doc:

- Does this serve the contract — *"your signal, for your benefit, never against you"*?
- Is this a fundamental **mode** (commit fully) or a **preference** (configurability is
  the enemy of usability)?
- Where does this derived value's provenance trail lead — can the user click to see it?
- Is this in the *doing-the-work* loop or the *reflecting-on-work* loop? If reflecting,
  is it earning its place, or is it decorative until there is signal?
- Does this require explicit user contribution? If so, is there an ambient-capture
  equivalent?
- Am I building this to leave a door open (data layer / API layer — fine) or to support
  an imagined future (product layer — don't)?
