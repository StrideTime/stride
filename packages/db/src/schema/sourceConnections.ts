import { pgTable, text, jsonb, timestamp, boolean, index } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import type { SourceType } from '../enums/SourceType';
import { workspacesTable } from './workspaces';

// The external unit a connection maps to: a Jira board, a Linear Team, or a GitHub repo.
export type MappedUnit = {
  unitType: string; // 'jira_board' | 'linear_team' | 'github_repo'
  externalId: string;
  label: string;
};

// Workspace-pooled connection to an external source account (Jira only in v1). Status and
// priority mappings belong to the unit mapping because workflows differ by board/team/repo.
// Credentials live here; the real implementation encrypts them at rest.
export const sourceConnectionsTable = pgTable(
  'source_connections',
  {
    id: text('id').primaryKey(),
    workspaceId: text('workspace_id')
      .notNull()
      .references(() => workspacesTable.id),
    sourceType: text('source_type').$type<SourceType>().notNull(),
    externalAccountId: text('external_account_id').notNull(),
    displayName: text('display_name').notNull(),
    credentials: jsonb('credentials').$type<Record<string, unknown>>(),
    mappedUnit: jsonb('mapped_unit').$type<MappedUnit>(),
    statusMapping: jsonb('status_mapping').$type<Record<string, string>>(),
    priorityMapping: jsonb('priority_mapping').$type<Record<string, string>>(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    deleted: boolean('deleted').notNull().default(false),
  },
  table => [index('idx_source_connections_workspace').on(table.workspaceId)],
);

export const insertSourceConnectionSchema = createInsertSchema(sourceConnectionsTable);
export const selectSourceConnectionSchema = createSelectSchema(sourceConnectionsTable);

export type SourceConnection = typeof sourceConnectionsTable.$inferSelect;
export type InsertSourceConnection = typeof sourceConnectionsTable.$inferInsert;
