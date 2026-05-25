# Issue tracker: Linear

Issues and PRDs for this repo live in Linear. Use the Linear CLI for issue operations.

## Conventions

- Use the Linear CLI from inside this repo when creating, reading, updating, or commenting on issues.
- If a Linear team/project/initiative is not specified by the user, ask before publishing.
- PRDs should become Linear issues unless the user explicitly asks for local markdown or another destination.
- Keep issue titles concise and action-oriented.
- Put implementation context, acceptance criteria, open questions, and references in the issue body.
- Use the triage labels defined in `docs/agents/triage-labels.md`.

## Triage workflow

Use Linear labels for agent triage state:

- `needs-triage` — maintainer needs to evaluate this issue
- `needs-info` — waiting on reporter or product clarification
- `ready-for-agent` — fully specified and suitable for an AFK agent
- `ready-for-human` — needs human implementation, review, or judgment
- `wontfix` — will not be actioned

Keep Linear workflow status separate from triage labels. Status should represent delivery state; labels represent agent-readiness state.

## When a skill says "publish to the issue tracker"

Create a Linear issue using the Linear CLI.

If the destination team/project/initiative is ambiguous, ask the user which Linear destination to use before creating the issue.

## When a skill says "fetch the relevant ticket"

Use the Linear CLI to read the issue, including description, comments, labels, status, assignee, project/initiative, and links when available.
