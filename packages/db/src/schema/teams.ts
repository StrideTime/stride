import { pgTable, text, timestamp, boolean, index } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { workspacesTable } from './workspaces';
import { workspaceIsolationPolicy } from './rls';

export type NewSpecDestination = 'needs-breakdown' | 'team-inbox' | 'ready';
export type TriageOwner = 'team-admins' | 'source-assignee' | 'unassigned';
export type MissingEstimatesBehavior = 'ask-during-breakdown' | 'allow-empty' | 'needs-review';
export type UnassignedWorkBehavior = 'team-inbox' | 'needs-breakdown' | 'hide-until-assigned';
export type ReadyToScheduleRule = 'one-action' | 'estimate-and-action' | 'manual';
export type StaleBreakdownNudge = 'off' | '3-days' | '5-days';

// A team within a Workspace — the source-sync boundary (mapped to a Jira board / Linear Team /
// GitHub repo via `teamSourceMappings`). Specs belong to a Team (the FK is nullable —
// uncategorized specs still appear, never hidden).
export const teamsTable = pgTable(
  'teams',
  {
    id: text('id').primaryKey(),
    workspaceId: text('workspace_id')
      .notNull()
      .references(() => workspacesTable.id),
    name: text('name').notNull(),
    newSpecDestination: text('new_spec_destination')
      .$type<NewSpecDestination>()
      .notNull()
      .default('needs-breakdown'),
    triageOwner: text('triage_owner').$type<TriageOwner>().notNull().default('team-admins'),
    missingEstimatesBehavior: text('missing_estimates_behavior')
      .$type<MissingEstimatesBehavior>()
      .notNull()
      .default('ask-during-breakdown'),
    unassignedWorkBehavior: text('unassigned_work_behavior')
      .$type<UnassignedWorkBehavior>()
      .notNull()
      .default('team-inbox'),
    readyToScheduleRule: text('ready_to_schedule_rule')
      .$type<ReadyToScheduleRule>()
      .notNull()
      .default('one-action'),
    staleBreakdownNudge: text('stale_breakdown_nudge')
      .$type<StaleBreakdownNudge>()
      .notNull()
      .default('3-days'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    deleted: boolean('deleted').notNull().default(false),
  },
  table => [
    index('idx_teams_workspace').on(table.workspaceId),
    workspaceIsolationPolicy('teams', table.workspaceId),
  ],
).enableRLS();

export const insertTeamSchema = createInsertSchema(teamsTable);
export const selectTeamSchema = createSelectSchema(teamsTable);

export type Team = typeof teamsTable.$inferSelect;
export type InsertTeam = typeof teamsTable.$inferInsert;
