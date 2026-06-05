---
title: Jira source mapping findings
updated: 2026-06-05
status: draft
owner: jaren
---

# Jira source mapping findings

Findings from the Jira API discovery spike in `apps/api/src/jira/*`, checked against the current
`packages/db` schema and the mock Settings source-mapping UI.

This is an implementation note, not a new product direction. It refines the existing decision that
source units are first-class sync targets and that status / priority / difficulty mappings belong
to the Team Source mapping.

## Recommended connection flow

The product flow should use **Atlassian OAuth 2.0 3LO** as the primary connection path, with API
token/basic-auth support kept only for local development and manual fallback.

1. Workspace admin selects **Connect Jira**.
2. Stride redirects to Atlassian OAuth consent.
3. User chooses the Atlassian site and grants access.
4. Stride exchanges the authorization code for tokens.
5. Stride calls `GET https://api.atlassian.com/oauth/token/accessible-resources` to discover Jira
   `cloudId`, site URL/name, and granted scopes.
6. Stride discovers boards available to that connection and stores them as `sourceUnits`.
7. Team admin chooses one Jira board for a Stride Team.
8. Stride runs board discovery and proposes status, priority, and difficulty mappings.
9. Team admin reviews and saves mappings.

Official docs:

- OAuth 2.0 3LO authorization flow and `accessible-resources`:
  <https://developer.atlassian.com/cloud/jira/software/oauth-2-3lo-apps/>
- Jira Software OAuth scopes:
  <https://developer.atlassian.com/cloud/jira/software/scopes-for-oauth-2-3LO-and-forge-apps/>
- Basic auth with API tokens, useful for scripts/manual fallback only:
  <https://developer.atlassian.com/cloud/jira/platform/basic-auth-for-rest-apis/>

## Jira API realities that affect Stride

Jira board mapping is not just "select project, then sync issues."

- A Jira board is the right Stride source unit. Board issue APIs define membership by whether the
  issue's status is mapped to the board's columns; epic issues do not belong to scrum boards in the
  board issue API.
- Board configuration is critical mapping metadata. `GET /rest/agile/1.0/board/{boardId}/configuration`
  returns columns, status ids per column, ranking, and Scrum estimation field metadata. Jira treats
  the last column with statuses mapped to it as the Done column.
- Board configuration has stronger permission/scope requirements than issue reads. The OAuth app
  may have the `read:board-scope.admin:jira-software` scope, but Jira still constrains access by
  the user's Jira permissions.
- Jira OAuth calls use `https://api.atlassian.com/ex/jira/{cloudId}/...`, not direct
  `https://site.atlassian.net/...` URLs. The spike uses direct URLs because it was built for API
  token testing.
- A board can be associated with multiple projects via its filter. `sourceUnits.metadata.jira`
  cannot assume one project id/key/name.
- Difficulty is optional and board-specific. Scrum boards may expose an estimation field such as
  Story Points; Kanban boards or team-managed projects may not expose the same field, and a board
  can have no meaningful difficulty source.
- Priority discovery is partly global/site-level and partly observed from board issues. Confirming
  project-specific priority availability may require broader configuration APIs/scopes.
- Changelog can provide status, priority, and assignee history, but this should be used for sync
  correctness and source activity provenance, not individual monitoring.

Relevant endpoint docs:

- Board metadata/config/issues/projects:
  <https://developer.atlassian.com/cloud/jira/software/rest/api-group-board/>
- Project statuses:
  <https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-projects/>
- Priorities:
  <https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issue-priorities/>
- Fields/custom field discovery:
  <https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issue-fields/>
- Issue changelog:
  <https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issues/>

## Current schema gaps

### `sourceConnections`

Current shape: `metadata` stores Jira `cloudId`, `siteUrl`, and optional `siteName`; `credentials`
is untyped JSON.

Needed changes:

- Model Jira OAuth explicitly. Store provider account identity, `cloudId`, site URL/name, granted
  scopes, connection status, token expiry, and an encrypted secret reference or encrypted token
  envelope. Do not rely on raw `Record<string, unknown>` credentials as the production contract.
- Support reconnect/repair states: missing scopes, revoked grant, refresh failed, and site no longer
  accessible.
- Treat one Jira site as one Stride `sourceConnection`. Atlassian grants can cover multiple sites,
  but Stride's pooled workspace connection should be explicit about which `cloudId` it is using.

### `sourceUnits`

Current Jira metadata stores one `projectId`, `projectKey`, and `projectName`.

Needed changes:

- Replace single project fields with a project array:
  `projects: Array<{ id: string; key?: string; name?: string }>` plus `location`.
- Store board configuration summary:
  board type, filter id, subquery, column list, status ids per column, Done-column status ids,
  ranking field id, estimation type, estimation field id/name.
- Store discovery health:
  when the board was last discovered, whether board config was accessible, which optional calls
  failed, and whether mapping values are incomplete because of Jira permissions.
- Keep `externalId = boardId` stable. Use board display name only as display text.

### `teamSourceMappings`

Current mapping shape is `Record<string, SourceMappedBadge>`, where the record key implicitly
stands for the source key and `sourceLabel` is stored in the value.

Needed changes:

- Make source value identity explicit. Each mapping entry should preserve:
  `sourceKey`, `sourceLabel`, optional `sourceFieldId`, optional `sourceFieldName`, and
  `sourceValueKind` (`status`, `priority`, `difficulty`).
- Status mappings need board context: board column name, column order, Jira status category, and
  `isDoneColumn`. Do not infer done from the status name.
- Priority mappings should distinguish observed board priorities from site priority values.
- Difficulty mapping needs a source field descriptor at the section level, not only per-value rows:
  `fieldId`, `fieldName`, `fieldSchema`, `isConfiguredOnBoard`, and `unavailableReason`.
- Mapping entries need lifecycle flags: `observed`, `configured`, `missingInSource`,
  `requiresReview`. This lets Stride survive Jira workflow changes without silently dropping or
  remapping existing Specs.
- `importScope` should become a typed enum/config object. Jira's realistic initial scopes are
  "all non-done board issues" and possibly "assigned to known workspace members"; "all issues" is
  not a useful default for an execution backlog.

### `specs`

Current shape stores `sourceStatus`, `sourcePriority`, and `sourceDifficulty` as text, with mapped
fields stored separately.

Needed changes:

- Preserve source keys and labels separately on Specs, at least for status and priority:
  `sourceStatusKey`, `sourceStatusLabel`, `sourcePriorityKey`, `sourcePriorityLabel`.
- Difficulty should preserve the field id and raw value. A scalar Story Points value and an option
  custom field value should not be collapsed into the same text slot.
- `mappedStatus` is currently non-null. Real Jira sync can produce unmapped statuses during initial
  setup, workflow changes, or permission-limited discovery. Either allow null/pending mapped fields
  or define a stable `unmapped` fallback key with review behavior.
- Assignee mapping needs source identity. Jira assignee is an Atlassian `accountId`; it may not map
  to a Stride user. Store source assignee metadata in source-owned fields or `sourceData`, then link
  to `assigneeUserId` only when the account is matched.

## Current settings UI gaps

The Settings implementation is mock-data-backed and assumes a happier world than Jira gives us.

### Workspace Source Connections

Current UI shows connected Jira/Linear/GitHub accounts and "Available source teams." For Jira it
should become:

- **Connect Jira** via OAuth, not API token paste.
- After OAuth, show accessible Jira sites from `accessible-resources`; if multiple sites are
  granted, the admin picks one site per workspace connection.
- Show discovered source units as **Jira boards**, not "source teams."
- Show per-board discovery health: "ready", "needs board config permission", "no estimation field",
  "already mapped", "sync unavailable".
- Allow reconnect/repair when scopes are missing or the Atlassian grant is revoked.

### Team Source Mapping

Current UI uses static source-type and source-unit options, editable badge rows, and hardcoded
Status/Priority/Difficulty tables.

Needed behavior:

- Source-unit choices must come from `sourceUnits`, filtered to unmapped units or the team's current
  unit. Claimed units should be disabled with the owning Stride Team named.
- Mapping tables should be generated from discovery results, not local constants.
- Status mapping must display Jira board columns and status labels. The Done/default completion
  behavior should follow Jira's Done column, not a label named "Done."
- Difficulty mapping should be hidden or shown as "not configured" when no board estimation field is
  available. Do not force "1 point / 3 points / 5 points / 8+ points."
- Priority mapping should show observed values first, with an option to include site priority values
  not yet observed on the board.
- Save should be blocked or warned when required source values are unmapped, and existing mappings
  should be marked for review when a source value disappears.

## Recommended implementation sequence

1. Replace spike basic-auth client with an Atlassian OAuth 3LO connection flow.
2. Add a Jira discovery service that writes `sourceConnections` and `sourceUnits` from OAuth-backed
   board discovery.
3. Adjust schema types/migrations for explicit source keys/labels, Jira board configuration
   metadata, discovery health, and nullable/reviewable mapped values.
4. Build Workspace Source Connections against real connection/unit data.
5. Build Team Source Mapping from `/mapping-values`-style discovery payloads.
6. Add sync guards: no silent mapping when config access is missing; no hidden issues just because a
   source unit is unmapped; no individual monitoring views from changelog/assignee history.
