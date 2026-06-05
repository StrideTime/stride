import { pgTable, text, jsonb, timestamp, boolean, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import type { SourceType } from '../enums/SourceType';
import type { SourceUnitType } from '../enums/SourceUnitType';
import { workspacesTable } from './workspaces';
import { sourceConnectionsTable } from './sourceConnections';
import { workspaceIsolationPolicy } from './rls';

export type JiraBoardMetadata = {
  boardId: string;
  boardType?: 'scrum' | 'kanban' | 'simple';
  projectId?: string;
  projectKey?: string;
  projectName?: string;
  selfUrl?: string;
};

export type LinearTeamMetadata = {
  teamId: string;
  teamKey?: string;
  url?: string;
};

export type GitHubRepoMetadata = {
  owner: string;
  repo: string;
  repoId?: string;
  fullName: string;
  htmlUrl?: string;
};

export type SourceUnitMetadata =
  | { provider: 'jira'; jira: JiraBoardMetadata }
  | { provider: 'linear'; linear: LinearTeamMetadata }
  | { provider: 'github'; github: GitHubRepoMetadata };

// A syncable unit available through a source connection: Jira board, Linear Team, or GitHub repo.
// Team Source mapping points here instead of duplicating provider-specific unit ids.
export const sourceUnitsTable = pgTable(
  'source_units',
  {
    id: text('id').primaryKey(),
    workspaceId: text('workspace_id')
      .notNull()
      .references(() => workspacesTable.id),
    sourceConnectionId: text('source_connection_id')
      .notNull()
      .references(() => sourceConnectionsTable.id),
    sourceType: text('source_type').$type<SourceType>().notNull(),
    unitType: text('unit_type').$type<SourceUnitType>().notNull(),
    externalId: text('external_id').notNull(),
    displayName: text('display_name').notNull(),
    url: text('url'),
    metadata: jsonb('metadata').$type<SourceUnitMetadata>(),
    lastDiscoveredAt: timestamp('last_discovered_at', { withTimezone: true }),
    lastSyncedAt: timestamp('last_synced_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    deleted: boolean('deleted').notNull().default(false),
  },
  table => [
    index('idx_source_units_workspace').on(table.workspaceId),
    index('idx_source_units_connection').on(table.sourceConnectionId),
    uniqueIndex('idx_source_units_connection_external').on(
      table.sourceConnectionId,
      table.unitType,
      table.externalId,
    ),
    workspaceIsolationPolicy('source_units', table.workspaceId),
  ],
).enableRLS();

export const insertSourceUnitSchema = createInsertSchema(sourceUnitsTable);
export const selectSourceUnitSchema = createSelectSchema(sourceUnitsTable);

export type SourceUnit = typeof sourceUnitsTable.$inferSelect;
export type InsertSourceUnit = typeof sourceUnitsTable.$inferInsert;
