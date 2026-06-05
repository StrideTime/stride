import { pgTable, text, jsonb, timestamp, boolean, index } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import type { ColorToken } from '../enums/ColorToken';
import type { IconToken } from '../enums/IconToken';
import { workspacesTable } from './workspaces';
import { teamsTable } from './teams';
import { sourceConnectionsTable } from './sourceConnections';
import { sourceUnitsTable } from './sourceUnits';
import { workspaceIsolationPolicy } from './rls';

export type SourceMappedBadge = {
  sourceLabel: string;
  mappedKey: string;
  display: 'text' | 'icon';
  text?: string;
  icon?: IconToken;
  colorToken: ColorToken;
};

export type SourceStatusMapping = Record<
  string,
  SourceMappedBadge & {
    sourceCategory?: 'backlog' | 'todo' | 'in_progress' | 'blocked' | 'done';
  }
>;

export type SourcePriorityMapping = Record<string, SourceMappedBadge>;

export type SourceDifficultyMapping = Record<string, SourceMappedBadge>;

// Maps a Team to one external source unit (a Jira board / Linear Team / GitHub repo) drawn
// from a pooled SourceConnection. Status / priority / difficulty mappings live HERE, not on
// the connection, because workflows differ per board/team/repo. A Team has exactly one primary
// mapping in v1 (enforced in the service layer). Each external unit maps to one Team per
// Workspace.
export const teamSourceMappingsTable = pgTable(
  'team_source_mappings',
  {
    id: text('id').primaryKey(),
    workspaceId: text('workspace_id')
      .notNull()
      .references(() => workspacesTable.id),
    teamId: text('team_id')
      .notNull()
      .references(() => teamsTable.id),
    sourceConnectionId: text('source_connection_id')
      .notNull()
      .references(() => sourceConnectionsTable.id),
    sourceUnitId: text('source_unit_id')
      .notNull()
      .references(() => sourceUnitsTable.id),
    // source field id/key → Stride badge metadata. Source values stay source-owned; mapped
    // values define the local text/icon/color badge used for filters and display.
    statusMapping: jsonb('status_mapping').$type<SourceStatusMapping>(),
    priorityMapping: jsonb('priority_mapping').$type<SourcePriorityMapping>(),
    difficultyMapping: jsonb('difficulty_mapping').$type<SourceDifficultyMapping>(),
    importScope: text('import_scope'), // e.g. 'all_open'
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    deleted: boolean('deleted').notNull().default(false),
  },
  table => [
    index('idx_team_source_mappings_team').on(table.teamId),
    index('idx_team_source_mappings_workspace').on(table.workspaceId),
    index('idx_team_source_mappings_source_unit').on(table.sourceUnitId),
    workspaceIsolationPolicy('team_source_mappings', table.workspaceId),
  ],
).enableRLS();

export const insertTeamSourceMappingSchema = createInsertSchema(teamSourceMappingsTable);
export const selectTeamSourceMappingSchema = createSelectSchema(teamSourceMappingsTable);

export type TeamSourceMapping = typeof teamSourceMappingsTable.$inferSelect;
export type InsertTeamSourceMapping = typeof teamSourceMappingsTable.$inferInsert;
