import { pgTable, text, jsonb, timestamp, boolean, index } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import type { SourceType } from '../enums/SourceType';
import { workspacesTable } from './workspaces';
import { workspaceIsolationPolicy } from './rls';

export type JiraConnectionMetadata = {
  cloudId: string;
  siteUrl: string;
  siteName?: string;
};

export type LinearConnectionMetadata = {
  organizationId: string;
  organizationUrlKey: string;
};

export type GitHubConnectionMetadata = {
  installationId: string;
  accountLogin: string;
  accountType: 'User' | 'Organization';
};

export type SourceConnectionMetadata =
  | { provider: 'jira'; jira: JiraConnectionMetadata }
  | { provider: 'linear'; linear: LinearConnectionMetadata }
  | { provider: 'github'; github: GitHubConnectionMetadata };

// Workspace-pooled connection to an external source account (Jira only in v1). Credentials
// live here; the real implementation encrypts them at rest. Syncable units discovered through
// the connection live in `sourceUnits`.
export const sourceConnectionsTable = pgTable(
  'source_connections',
  {
    id: text('id').primaryKey(),
    workspaceId: text('workspace_id')
      .notNull()
      .references(() => workspacesTable.id),
    sourceType: text('source_type').$type<SourceType>().notNull(),
    displayName: text('display_name').notNull(),
    metadata: jsonb('metadata').$type<SourceConnectionMetadata>(),
    credentials: jsonb('credentials').$type<Record<string, unknown>>(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    deleted: boolean('deleted').notNull().default(false),
  },
  table => [
    index('idx_source_connections_workspace').on(table.workspaceId),
    workspaceIsolationPolicy('source_connections', table.workspaceId),
  ],
).enableRLS();

export const insertSourceConnectionSchema = createInsertSchema(sourceConnectionsTable);
export const selectSourceConnectionSchema = createSelectSchema(sourceConnectionsTable);

export type SourceConnection = typeof sourceConnectionsTable.$inferSelect;
export type InsertSourceConnection = typeof sourceConnectionsTable.$inferInsert;
