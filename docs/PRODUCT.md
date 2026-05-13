# Product

## Register

product

## Users

Software engineering teams using Jira or Linear as their source of truth. The primary user is the individual contributor — someone who runs sessions, closes specs, and wants to understand their own productivity without extra overhead. Even solo users operate in a team context; Stride is designed to be most valuable when paired with an existing issue tracker.

Team leads and workspace admins are secondary users. They need aggregate visibility (throughput, estimates vs actuals, team patterns) but should never feel like they're surveilling individual contributors. The nitty-gritty stays personal.

## Product Purpose

Stride is a cross-platform productivity and team coordination tool that sits on top of Jira and Linear. It helps individuals track work sessions, manage their backlog, and see what they've actually shipped — then surfaces that progress in a rewarding way. Leads get aggregate patterns; ICs get a personal productivity loop. The goal is to make daily work feel purposeful and winnable, not monitored.

Platforms: web (primary), desktop tray (companion), mobile (future).

## Brand Personality

Minimal, useful, rewarding. Stride gets out of the way, does its job precisely, and makes progress feel good. Not corporate, not gamified-for-its-own-sake — rewarding because the feedback is real and earned.

## Anti-references

- **Jira**: bloated UI, corporate jargon, overwhelming density, everything requiring clicks to find anything
- **Big-brother dashboards**: per-person productivity leaderboards, micromanagement-oriented metrics, anything that makes ICs feel watched or compared
- **OKR/performance-review tools**: corporate goal-setting cadence, abstract key results disconnected from actual work

## Design Principles

1. **Individual first.** The default lens is "what am I doing / what did I accomplish" — not how someone ranks against their teammates. Team views are aggregate and never expose individual-level detail to peers.
2. **Data earns its place.** Every metric shown should drive an action or celebrate a win. If a number doesn't change behavior or feel good to see, it shouldn't be visible by default.
3. **Clarity over completeness.** Show what matters now and hide what doesn't. Linear does this well — Stride follows the same discipline. No field shown just because it exists.
4. **Rewarding by default.** Small wins should feel satisfying. Closing a spec, finishing a session, hitting a streak — these moments should register and feel good without being cartoon-level gamified.
5. **Visibility without surveillance.** Leads and admins see aggregate patterns, not individual granularity. Psychological safety is a product constraint, not a nice-to-have.

## Accessibility & Inclusion

WCAG AA as the baseline. Standard semantic HTML, keyboard navigation, screen reader support, and sufficient color contrast throughout. Respect `prefers-reduced-motion`. Design for broad audience appeal — the goal is to remove barriers, not build for a narrow audience.
